# Lühendite loetelu {.unnumbered}

**API** – Application Programming Interface, rakendusliides

**CSS** – Cascading Style Sheets, kaskaadlaadistik

**HTML** – HyperText Markup Language, hüperteksti märgistuskeel

# Sissejuhatus {#sec:sissejuhatus}

Siia kirjuta oma lõputöö sissejuhatus. Sissejuhatus peaks sisaldama:

- Teema aktuaalsust ja põhjendust
- Töö eesmärki
- Ülesandeid eesmärgi saavutamiseks
- Töö ülesehitust

Sissejuhatus ei ole nummerdatud, kuid ilmub sisukorras.

# Esimene peatükk {#sec:peatukk1}

See on esimene peatükk. Peatükid on nummerdatud automaatselt.

## Alapeatükk

Alapeatükid on samuti automaatselt nummerdatud, näiteks 1.1, 1.2 jne.

### Alampeatükk

Kolmanda taseme pealkirjad on nummerdatud 1.1.1, 1.1.2 jne.

## Viitamine allikatele

Viita allikatele kasutades `[@võti]` süntaksit, näiteks [@raamat2024]. Mitme allika viitamiseks kasuta `[@allikas1; @allikas2]`.

## Pildid

Pildi lisamiseks kasuta järgmist süntaksit:

![Pildi pealkiri](images/example.png){#fig:naidis width=80%}

Pildile saad viidata tekstis: vaata @fig:naidis.

## Tabelid

| Veerg 1 | Veerg 2 | Veerg 3 |
|---------|---------|---------|
| Rida 1  | Andmed  | 123     |
| Rida 2  | Andmed  | 456     |

: Tabeli pealkiri {#tbl:naidis}

Tabelile viitamine: vaata @tbl:naidis.

## Koodiplokid

Koodiploki lisamiseks kasuta kolme tagurpidi ülakomaga:

```javascript
function tervitus(nimi) {
  console.log(`Tere, ${nimi}!`)
}
```

Inline koodi jaoks kasuta üksikut tagurpidi ülakoma: `npm install`.

# Teine peatükk {#sec:peatukk2}

Siia tuleb teine peatükk oma sisuga.

Viita teisele peatükile: vaata @sec:peatukk1.

# Kokkuvõte {#sec:kokkuvote}

Kokkuvõte ei ole nummerdatud. Siia kirjuta:

- Töö põhitulemused
- Kas eesmärgid said täidetud
- Võimalikud edasiarendused

# Kasutatud allikad {.unnumbered}

::: {#refs}
:::

\appendix

# Lisade pealkiri {#sec:lisa-a}

Lisad nummerdatakse tähtedega: Lisa A, Lisa B jne.

Siia võid panna:

- Mahukad koodinäited
- Lisatabelid
- Ekraanipildid
- Muu täiendav materjal

# Summary {.unnumbered}

Write here a brief summary in English (approximately 1 page).

This section should include:

- The aim of the thesis
- Main results
- Conclusions
