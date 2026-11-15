## Aplikacja User Explorer

Projekt służący do zbadania i zrozumienia działania biblioteki React Query.

### Co React Query naprawiło i zrobiło za mnie

React Query uprościło cały proces pobierania danych. Dzięki bibliotece dostaję:

- **Wbudowany cache** — bez potrzeby ręcznego tworzenia.
- **Flagi opisujące bieżący stan zapytania:**
    - `isFetching` — czy zapytanie aktualnie pobiera dane,
    - `isLoading` — `true` przy pierwszym pobraniu,
    - `isError` — pobieranie zakończone niepowodzeniem.
- **Optymistyczne aktualizacje** — użytkownik od razu widzi dane, które wyklikał; aktualizacja GUI następuje przed potwierdzeniem z serwera. Jeśli serwer odrzuci zapytanie, następuje rollback.
- **Anulowanie nieaktualnych żądań** — dzięki przekazaniu `signal` do `queryFn` i kluczom zapytań koniec z wyścigiem, w którym odpowiedź na `a` nadpisuje odpowiedź na `anna`.
- **Wspólny cache między komponentami** — lista i detale korzystają z tych samych danych. Mój własny hook tego nie potrafił, bo każde użycie tworzyło osobną instancję stanu, bez wspólnego providera.

### Co wyleciało po przejściu na `useQuery`

Zniknął cały `useAsyncResources.ts`, a w nim:

- `AbortController`,
- hashowanie klucza przez `JSON.stringify`,
- stan `settled` i wyliczanie `loading` w renderze,
- token ponowienia,
- `useEffectEvent`.

### Konfiguracja

`staleTime` odpowiada wyłącznie na pytanie: „jak długo jestem w stanie pokazywać dane, które ktoś inny mógł zmienić". Dane może zmienić jedynie moja aplikacja, więc wybór padł na `Infinity`. Własne zapisy obsługuje `onSettled` w mutacji — inwalidacja działa ponad `staleTime`, więc po każdej mutacji lista i tak zostanie pobrana ponownie.

Przy `Infinity` nie ma odświeżania: ani przy powrocie fokusu, ani po odzyskaniu sieci. Ze względu na charakterystykę aplikacji jest to akceptowalne — dane zmieniamy wyłącznie przez GUI i nic innego ich nie modyfikuje.

Detale są zasiewane przez `initialData` z cache listy. Ponieważ działają na tych samych danych co lista, `Infinity` zadziałałoby i tutaj. Gdyby jednak endpoint szczegółów zaczął kiedyś zwracać więcej pól, dane byłyby niepełne — dlatego dla tego zapytania zostaje domyślne `0`.