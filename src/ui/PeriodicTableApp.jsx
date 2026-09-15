'use client';

import { useMemo, useState } from 'react';
import {
  ALL_VALUE,
  compareElements,
  filterElements,
  formatValue,
  getComparisonNote,
  getElementGridStyle,
  getUniqueOptions,
  toggleComparisonSelection,
} from '../lib/chemistry.mjs';

const categoryClass = {
  '알칼리 금속': 'category-alkali',
  '알칼리 토금속': 'category-alkaline',
  '전이 금속': 'category-transition',
  '전이후 금속': 'category-post',
  준금속: 'category-metalloid',
  비금속: 'category-nonmetal',
  할로젠: 'category-halogen',
  '비활성 기체': 'category-noble',
};

const fieldLabels = [
  ['atomic_number', '원자번호'],
  ['atomic_mass', '원자량'],
  ['category', '계열'],
  ['period', '주기'],
  ['group', '족'],
  ['state_at_room_temp', '상온 상태'],
  ['electron_configuration', '전자배치'],
  ['electronegativity', '전기음성도'],
  ['oxidation_states', '주요 산화수'],
  ['atomic_radius', '원자 반지름 (pm)'],
  ['first_ionization_energy', '1차 이온화 에너지 (eV)'],
  ['melting_point', '녹는점 (K)'],
  ['boiling_point', '끓는점 (K)'],
  ['density', '밀도 (g/cm³)'],
];

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="filter-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value={ALL_VALUE}>전체</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function PeriodicTableApp({ initialData }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL_VALUE);
  const [state, setState] = useState(ALL_VALUE);
  const [period, setPeriod] = useState(ALL_VALUE);
  const [group, setGroup] = useState(ALL_VALUE);
  const [selectedSymbol, setSelectedSymbol] = useState('H');
  const [comparisonSymbols, setComparisonSymbols] = useState(['Na', 'Cl']);

  const elements = initialData.elements;
  const selectedElement = elements.find((element) => element.symbol === selectedSymbol) ?? elements[0];
  const filteredElements = useMemo(
    () => filterElements(elements, { query, category, state, period, group }),
    [elements, query, category, state, period, group],
  );
  const visibleSymbols = new Set(filteredElements.map((element) => element.symbol));
  const comparisonElements = comparisonSymbols
    .map((symbol) => elements.find((element) => element.symbol === symbol))
    .filter(Boolean);
  const comparisonRows = compareElements(comparisonElements[0], comparisonElements[1]);
  const comparisonNote = getComparisonNote(comparisonElements[0], comparisonElements[1], initialData.notes);

  const categories = getUniqueOptions(elements, 'category');
  const states = getUniqueOptions(elements, 'state_at_room_temp');
  const periods = getUniqueOptions(elements, 'period');
  const groups = getUniqueOptions(elements, 'group');

  const handleElementClick = (element) => {
    setSelectedSymbol(element.symbol);
    setComparisonSymbols((current) => toggleComparisonSelection(current, element.symbol));
  };

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">비교 중심 화학 학습</p>
            <h1>원소 주기율표</h1>
          </div>
          <div className={`data-status ${initialData.source === 'supabase' ? 'online' : 'fallback'}`}>
            <strong>{initialData.source === 'supabase' ? 'Supabase 연결됨' : 'Fallback 데이터 사용 중'}</strong>
            {initialData.error ? <span>{initialData.error}</span> : <span>원소 데이터를 불러왔습니다.</span>}
          </div>
        </header>

        <section className="controls" aria-label="검색 및 필터">
          <label className="search-field">
            <span>검색</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="원소명, 기호, 원자번호"
            />
          </label>
          <SelectField label="계열" value={category} onChange={setCategory} options={categories} />
          <SelectField label="상태" value={state} onChange={setState} options={states} />
          <SelectField label="주기" value={period} onChange={setPeriod} options={periods} />
          <SelectField label="족" value={group} onChange={setGroup} options={groups} />
        </section>

        <section className="table-area" aria-label="주기율표">
          <div className="periodic-grid">
            {elements.map((element) => {
              const isVisible = visibleSymbols.has(element.symbol);
              const isSelected = selectedElement?.symbol === element.symbol;
              const isCompared = comparisonSymbols.includes(element.symbol);
              return (
                <button
                  key={element.symbol}
                  className={[
                    'element-tile',
                    categoryClass[element.category] ?? 'category-unknown',
                    isVisible ? '' : 'dimmed',
                    isSelected ? 'selected' : '',
                    isCompared ? 'compared' : '',
                  ].join(' ')}
                  style={getElementGridStyle(element)}
                  onClick={() => handleElementClick(element)}
                  title={`${element.name_ko} (${element.symbol})`}
                >
                  <span className="atomic-number">{element.atomic_number}</span>
                  <strong>{element.symbol}</strong>
                  <span className="element-name">{element.name_ko}</span>
                </button>
              );
            })}
          </div>
          {filteredElements.length === 0 ? (
            <p className="empty-state">조건에 맞는 원소가 없습니다. 검색어 또는 필터를 조정해 주세요.</p>
          ) : null}
        </section>
      </section>

      <aside className="inspector" aria-label="원소 상세 및 비교">
        <section className="panel">
          <div className="panel-heading">
            <p className="eyebrow">선택한 원소</p>
            <h2>
              {selectedElement.name_ko} <span>{selectedElement.symbol}</span>
            </h2>
          </div>
          <p className="summary">{selectedElement.summary}</p>
          <dl className="detail-grid">
            {fieldLabels.map(([key, label]) => (
              <div key={key}>
                <dt>{label}</dt>
                <dd>{formatValue(selectedElement[key])}</dd>
              </div>
            ))}
          </dl>
          <div className="learning-note">
            <h3>화학적 특징</h3>
            <p>{formatValue(selectedElement.chemical_characteristics)}</p>
          </div>
          <div className="examples">
            <h3>대표 예시</h3>
            {selectedElement.examples?.map((example) => (
              <article key={`${selectedElement.symbol}-${example.title}`}>
                <strong>{example.title}</strong>
                <span>{example.context}</span>
                <p>{example.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading with-action">
            <div>
              <p className="eyebrow">비교 모드</p>
              <h2>두 원소 비교</h2>
            </div>
            <button className="ghost-button" onClick={() => setComparisonSymbols([])}>
              초기화
            </button>
          </div>
          <div className="comparison-picks">
            {[0, 1].map((index) => (
              <div key={index} className="comparison-pick">
                <span>{index + 1}</span>
                <strong>{comparisonElements[index]?.name_ko ?? '선택 대기'}</strong>
                <small>{comparisonElements[index]?.symbol ?? '원소를 클릭하세요'}</small>
              </div>
            ))}
          </div>
          <p className="comparison-note">{comparisonNote}</p>
          {comparisonRows.length ? (
            <div className="comparison-table">
              {comparisonRows.map((row) => (
                <div key={row.key} className={`comparison-row ${row.trend}`}>
                  <span>{row.label}</span>
                  <strong>{formatValue(row.valueA)}</strong>
                  <strong>{formatValue(row.valueB)}</strong>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </aside>
    </main>
  );
}
