Запуск локально:

```npm start```

---

Поиск реализован в ```findStreets(request)```.

В функции в цикле выполняется ```indexOf```, поэтому оцениваю сложность как O(N^2).

Для более умного поиска при инициализации скрипта для каждой улицы определяется тип (бульвар, проспект и тд.), что позволяет искать только по названию сущности независимо от формата ввода, то есть ```Красина```, ```улица Красина``` и ```Красина, улица``` найдут улицу с одинаковым успехом, только без уточнения типа в результаты поиска попадут все улицы с такой подстрокой в названии, а с уточнением — только результаты подходящего типа.
