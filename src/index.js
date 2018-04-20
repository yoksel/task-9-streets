import './styles.css';

import {streets} from './data/streets';
import {types, typesMap} from './data/dictionary';

const streetsSet = prepareStreets(streets);
const inputElem = document.querySelector('.streets__input');
const outputElem = document.querySelector('.streets__output');
const counterElem = document.querySelector('.streets__counter');
const showAllElem = document.querySelector('.streets__show-all');
const showAllClassHidden = 'streets__show-all--hidden';

// Хранилище результатов для уточняющего поиска
// Очищается если пользователь стёр часть запроса или стёр запрос
let founded = [];
let lastRequest = '';
const max = 10;

// ------------------------------
// События

inputElem.addEventListener('input', handleRequest);
showAllElem.addEventListener('click', showAllItems);

// ------------------------------
// Подготовка улиц к фильтрации: извлечение типа

// console.log(streetsSet);
function prepareStreets(streetsSrc) {
    streetsSrc = streetsSrc.map(item => {
        let type = getType(item).type;

        return {
            name: item,
            type: type
        };
    });

    return streetsSrc;
}

// ------------------------------
// Поиск улиц в массиве по запросу

function findStreets(request) {
    const result = [];
    const firstLetter = request.str[0];
    let counter = 0;
    let listForSearch = founded.length > 0 ? founded : streetsSet;
    let item;
    let firstLetterFounded = false;

    // Тип определился и вырезался из строки,
    // название ещё не введено
    if (!request.str) {
        return result;
    }

    // var time = performance.now();

    for (item of listForSearch) {
        const name = item.name;
        const type = item.type;
        const nameForSearch = name.toLowerCase();

        // Первая буква названия и первая буква запроса не совпадают
        if(nameForSearch[0] !== firstLetter) {
            // Началась следующая буква, прерываем цикл
            if(firstLetterFounded) {
                break;
            }
            // Нужная буква не найдена, продолжаем искать
            continue;
        }

        firstLetterFounded = true;
        let street = '';
        let isMatched = false;

        if (nameForSearch.indexOf(request.str) > -1) {
            // Из запроса известен тип: улица, переулок и тд
            if (request.type) {
                // Тип совпал
                if (type === request.type) {
                    isMatched = true;
                }

            } else {
                // Тип неизвестен
                isMatched = true;
            }

            if (isMatched) {
                result.push(item);
                counter++;
            }
        }
    }

    // time = performance.now() - time;
    // console.log('Время выполнения: ', time);

    return result;
}

// ------------------------------
// Обработка запроса: извлечение смысловой части и типа

function prepareRequest(str) {
    str = str.replace(',', '');
    str = str.toLowerCase();

    let typeObj = getType(str);
    let type = typeObj.type;

    if (typeObj.searchResult) {
        str = str.replace(typeObj.searchResult, '');
        str = str.trim();
    }

    return {
        str: str,
        type: type
    };
}

// ------------------------------
// Извлечение типа из строки

function getType(str) {
    let type = '';
    const reguestArr = str.split(' ');

    let typeSearch = reguestArr.filter(item => {
        return types.includes(item);
    });

    if (typeSearch) {
        type = typeSearch[0];

        if (typesMap[type]) {
            type = typesMap[type];
        }
    }

    return {
        type: type,
        searchResult: typeSearch
    };
}

// ------------------------------
// Обработка ввода

function handleRequest() {
    let request = prepareRequest(this.value);
    let data = {};

    // Пользователь стёр часть запроса, очищаем найденое и ищем с нуля
    if (lastRequest.length > this.value.length) {
        founded = [];
    }

    if (this.value !== '') {
        founded = findStreets(request);

        if (founded.length) {
            data.output = founded
                .slice(0,max)
                .map(({name}) => name)
                .join('<br>');

        } else {
            if (request.type) {
                data.output = 'Введите название';
            }
            else {
                data.output = 'Ничего не найдено';
            }

        }

    } else {
        founded = [];
        data.output = '';
    }

    lastRequest = this.value;

    // Вывод
    data.counter = getCounter(founded.length, max);
    printToPage(data);
}

// ------------------------------
// Заполнение счётчика

function getCounter(foundedLength, maxLength) {
    let resultsCount = foundedLength;

    if (!resultsCount) {
        showAllElem.classList.add(showAllClassHidden);
        return '&nbsp;';
    }

    if (foundedLength > maxLength) {
        resultsCount = `${foundedLength}, показано ${maxLength}`;
        showAllElem.classList.remove(showAllClassHidden);

    } else if (foundedLength === maxLength) {
        resultsCount = `${foundedLength}, показаны все`;
        showAllElem.classList.add(showAllClassHidden);

    } else {
        showAllElem.classList.add(showAllClassHidden);
    }

    return `Найдено: ${resultsCount}`;
}

// ------------------------------
// Вывод на страницу

function printToPage(data) {
    outputElem.innerHTML = data.output;
    counterElem.innerHTML = data.counter;
}

// ------------------------------
// Показать все результаты

function showAllItems() {
    const data = {};
    data.output = founded
        .map(({name}) => name)
        .join('<br>');

    data.counter = getCounter(founded.length, founded.length);
    printToPage(data);
    showAllElem.classList.add(showAllClassHidden);
}
