import React, { useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';

const FilterComponent = ({ filterText, onFilter, onClear, t }) => (
    <div className="input-group mb-3 rounded">
        <input
            id="search"
            type="text"
            className="form-control border-end-0"
            placeholder={t('searchPlaceholder') || "Search..."}
            aria-label="Search Input"
            value={filterText}
            onChange={onFilter}
            style={{ boxShadow: 'none' }}
        />
        <button className="btn btn-outline-secondary border-start-0 bg-white" type="button" onClick={onClear}>
            <i className="bi bi-x"></i> X
        </button>
    </div>
);

const DataTableBase = ({ columns, data, t }) => {
    const [filterText, setFilterText] = useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

    // Filter Logic: Search across all object keys
    const filteredItems = useMemo(() => {
        if (!filterText) return data;
        return data.filter(item =>
            Object.values(item).some(val =>
                String(val).toLowerCase().includes(filterText.toLowerCase())
            )
        );
    }, [data, filterText]);

    const subHeaderComponentMemo = useMemo(() => {
        const handleClear = () => {
            if (filterText) {
                setResetPaginationToggle(!resetPaginationToggle);
                setFilterText('');
            }
        };

        return (
            <FilterComponent
                onFilter={e => setFilterText(e.target.value)}
                onClear={handleClear}
                filterText={filterText}
                t={t}
            />
        );
    }, [filterText, resetPaginationToggle, t]);

    const customStyles = {
        table: {
            style: {
                backgroundColor: 'var(--surface)',
            },
        },
        headRow: {
            style: {
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-secondary)',
                fontWeight: '600',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                borderBottom: '1px solid var(--border-color)',
                minHeight: '48px',
            },
        },
        rows: {
            style: {
                backgroundColor: 'var(--surface)',
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border-color)',
                '&:hover': {
                    backgroundColor: 'var(--bg-color)',
                    cursor: 'pointer',
                },
            },
        },
        pagination: {
            style: {
                backgroundColor: 'var(--surface)',
                borderTop: '1px solid var(--border-color)',
            },
        },
    };

    return (
        <div className="saas-card">
            <div className="saas-card-body p-0">
                <div className="p-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
                    {subHeaderComponentMemo}
                </div>
                <DataTable
                    columns={columns}
                    data={filteredItems}
                    pagination
                    paginationResetDefaultPage={resetPaginationToggle}
                    persistTableHead
                    highlightOnHover
                    pointerOnHover
                    responsive
                    customStyles={customStyles}
                />
            </div>
        </div>
    );
};

export default DataTableBase;