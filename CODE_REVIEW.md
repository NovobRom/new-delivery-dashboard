# Code Review: Nova Post Operations Dashboard

## Общая оценка

Кодовая база хорошо структурирована: четкое разделение на слои (store, utils, components, types), RTK, Zod-валидация, i18n, dark mode. При детальном ревью выявлены зоны для улучшения — от критических багов до архитектурных рекомендаций.

**Результаты проверок:**
- TypeScript: 0 ошибок
- Tests: 50 passed (5 файлов)
- ESLint: 1 error (`_minDate` unused)

---

## 1. КРИТИЧЕСКИЕ БАГИ (P0)

### 1.1 Дублирование и расхождение логики статуса доставки

**Файл:** `src/components/dashboard/charts/CourierRanking.tsx:20`

```ts
const isDelivered = c.status === 'Доставлено'
  || c.status.toLowerCase().includes('доставлено')
  && !c.status.toLowerCase().includes('не');
```

Дублирует `constants/statuses.ts:isDelivered()`, но с другой логикой (substring match vs exact match). Также — неочевидный приоритет операторов `||` / `&&`.

**Фикс:** Заменить на `isDelivered(c.status)` из `constants/statuses.ts`.

### 1.2 `createDatasetSelectors()` вызывается при каждом рендере

**Файлы:** `Dashboard.tsx:23`, `FilterBar.tsx:23-29`, `DashboardPage.tsx:7`

Фабрика создаёт НОВЫЕ `createSelector`-инстансы при каждом рендере, полностью нивелируя мемоизацию.

**Фикс:** Использовать предсозданные селекторы:
```ts
const selectors = target === 'deliveries' ? deliverySelectors : pickupSelectors;
```

### 1.3 Потенциальный RangeError на больших датасетах

**Файл:** `src/store/selectors.ts:118-121`

```ts
Math.min(...times) // crash при >100K записей
```

**Фикс:** Использовать `reduce()` вместо spread.

---

## 2. АРХИТЕКТУРНЫЕ ПРОБЛЕМЫ (P1)

### 2.1 Общий filtersSlice для разных датасетов

Фильтры, установленные на Delivery Analysis, сохраняются при переходе на Pickup Analysis. Неожиданное UX-поведение.

**Рекомендация:** Раздельные фильтры по target или сброс при навигации.

### 2.2 `store.subscribe()` на каждый dispatch

**Файл:** `src/store/index.ts:17-27`

Каждое Redux-действие вызывает `localStorage.setItem`, а не только изменения настроек.

**Рекомендация:** RTK `listenerMiddleware` с debounce для `settingsSlice`.

### 2.3 Повторяющийся route guard паттерн

**Файл:** `src/App.tsx:69-73`

`hasData ? <Page /> : <Navigate to="/import" />` повторяется 5 раз.

**Рекомендация:** Вынести в `<ProtectedRoute>` компонент.

---

## 3. КОНСИСТЕНТНОСТЬ КОДА (P2)

### 3.1 Хардкод строк вместо i18n

| Файл | Строки |
|---|---|
| `FilterBar.tsx:62-89` | "Країна", "Місто", "Підрозділ", "Кур'єр", "Reset" |
| `MultiSelect.tsx:100,104,114` | "Всі", "Скинути", "Нічого не знайдено", "Пошук..." |
| `DateRangePicker.tsx` | "Виберіть дати", "All Time", "Presets", "Custom Range", "Cancel", "Apply Range" |
| `CourierRanking.tsx:108,164` | "доставлено", "Успішність" |
| `PickupAnalysisPage.tsx:14`, `CouriersPage.tsx:14` | "Coming soon..." |

### 3.2 Несогласованные типизированные хуки

- `SettingsPage.tsx` — raw `useDispatch`/`useSelector` вместо `useAppDispatch`/`useAppSelector`
- `DataImport.tsx` — mix `useAppDispatch` с raw `useSelector`

### 3.3 Дублирование логики в `normalizeMethodName`

**Файл:** `src/constants/deliveryMethods.ts:43-47`

Переписывает проверки из `isHandDelivery()` вместо переиспользования.

### 3.4 Утилита `cn()` локальна в Button.tsx

Должна быть в `src/utils/cn.ts` для повсеместного использования.

### 3.5 Магические z-index значения

`z-[60]`, `z-[100000]`, `z-50`, `z-30`, `z-20` — без единой шкалы.

---

## 4. ПРОИЗВОДИТЕЛЬНОСТЬ (P2)

### 4.1 `RegionalChart` не мемоизирует prepareRegionalData

**Файл:** `RegionalChart.tsx:12` — нет `useMemo`, в отличие от остальных чартов.

### 4.2 Множественные проходы в selectFilteredRecords

**Файл:** `selectors.ts:18-54` — 5 последовательных `.filter()` вместо одного прохода.

### 4.3 `density` возвращается как string

**Файл:** `chartHelpers.ts:134` — `.toFixed(2)` возвращает string, не number.

---

## 5. ТЕСТИРОВАНИЕ (P1)

### 5.1 Низкое тестовое покрытие

**Протестировано:** utils (analytics, dateUtils), constants (statuses, deliveryMethods)

**НЕ протестировано:**
- `csvParser.ts` — самая сложная бизнес-логика
- Redux-селекторы (каскадная фильтрация)
- Ни один React-компонент
- Store reducers
- Import wizard (multi-step state machine)
- `chartHelpers.ts`

### 5.2 Дублированный тест-файл

`src/utils/analytics.test.ts` (3 теста) дублирует `src/utils/__tests__/analytics.test.ts` (9 тестов). Удалить старый файл.

---

## 6. БЕЗОПАСНОСТЬ И НАДЕЖНОСТЬ (P2)

### 6.1 localStorage без валидации

**Файл:** `settingsSlice.ts:10-13` — `JSON.parse()` без проверки типа результата. Повреждённые данные сломают app.

### 6.2 Внешний CDN для логотипа

**Файл:** `Header.tsx:26` — `cdn.brandfetch.io`. Если CDN недоступен — логотип пропадает.

### 6.3 PII в схеме данных

`phone`, `phone2`, `recipientName`, `address` хранятся как plain text.

---

## 7. ESLint ОШИБКА

**Файл:** `DateRangePicker.tsx:50` — `_minDate` declared but never used.

---

## 8. UX-ЗАМЕЧАНИЯ (P3)

1. Бесконечный `animate-bounce` на иконке загрузки (ImportPage) — отвлекает
2. Отсутствие скелетонов/спиннеров для графиков при фильтрации
3. ErrorBoundary — только `console.error`, нет отправки в сервис мониторинга
4. "Coming soon" страницы доступны через навигацию — лучше скрыть или дать placeholder

---

## 9. РЕЗЮМЕ ПРИОРИТЕТОВ

| Приоритет | # | Проблема | Влияние |
|---|---|---|---|
| **P0** | 1.1 | CourierRanking дублирует status-логику | Неверные данные |
| **P0** | 1.2 | createDatasetSelectors в render body | Нет мемоизации |
| **P0** | 1.3 | RangeError на Math.min/max spread | Crash на больших CSV |
| **P1** | 2.1 | Общие фильтры для разных датасетов | Неожиданное UX |
| **P1** | 3.1 | Хардкод строк вместо i18n | Сломан переключатель языков |
| **P1** | 5.1 | Нет тестов для CSV-парсера и компонентов | Низкая надежность |
| **P2** | 2.2 | store.subscribe на каждый dispatch | Лишние записи в localStorage |
| **P2** | 4.1-4.2 | Производительность фильтрации/графиков | Тормоза на больших данных |
| **P2** | 6.1 | localStorage без валидации | Потенциальный crash |
| **P3** | 3.2-3.5 | Консистентность кода | Maintainability |
| **P3** | 5.2 | Дублированный тест-файл | Путаница |
| **P3** | 7 | Lint-ошибка `_minDate` | CI fail |
