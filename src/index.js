import './styles.css';

import {streets} from './data/streets';
import {types, typesMap} from './data/dictionary';

const varsStr = types.join('|');
const streetsSet = prepareStreets(streets);
const inputElem = document.querySelector('.streets__input');
const outputElem = document.querySelector('.streets__output');
const counterElem = document.querySelector('.streets__counter');
const showAllElem = document.querySelector('.streets__show-all');
const showAllClassHidden = 'streets__show-all--hidden';

let isWaiting = false;
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

function prepareStreets(streetsSrc) {
    const regexp = new RegExp(`,{0,}\\s{1,}(${varsStr})`);

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
    let counter = 0;
    let listForSearch = founded.length > 0 ? founded : streetsSet;
    let item;

    for (item of listForSearch) {
        const name = item.name;
        const type = item.type;
        const nameForSearch = name.toLowerCase();
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
            data.output = 'Ничего не найдено';
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
