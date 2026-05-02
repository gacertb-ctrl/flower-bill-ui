import React, { useState, useMemo } from 'react';
import DataTable, { createTheme } from 'react-data-table-component';

// Create a custom theme matching the nature-inspired antigravity design
createTheme('antigravity', {
  text: {
    primary: 'inherit',
    secondary: 'inherit',
  },
  background: {
    default: 'transparent',
  },
  context: {
    background: 'rgba(229, 242, 229, 0.8)', // nature-100 with opacity
    text: 'inherit',
  },
  divider: {
    default: 'rgba(122, 184, 122, 0.2)', // nature-400 with opacity
  },
  action: {
    button: 'rgba(0,0,0,.54)',
    hover: 'rgba(0,0,0,.08)',
    disabled: 'rgba(0,0,0,.12)',
  },
}, 'light');

const customStyles = {
  headRow: {
    style: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)', // Very subtle so it works in light/dark
      borderBottomWidth: '1px',
      borderBottomColor: 'rgba(122, 184, 122, 0.3)', 
      fontWeight: '600',
      color: 'inherit', // Let it inherit dark mode text color from parent
    },
  },
  headCells: {
    style: {
      color: 'inherit',
    },
  },
  rows: {
    style: {
      backgroundColor: 'transparent',
      color: 'inherit', // Let it inherit dark mode text color from parent
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // works in light and dark
        transition: 'all 0.3s ease',
      },
      '&:not(:last-of-type)': {
        borderBottomStyle: 'solid',
        borderBottomWidth: '1px',
        borderBottomColor: 'rgba(122, 184, 122, 0.2)',
      },
    },
  },
  cells: {
    style: {
      color: 'inherit',
    },
  },
  pagination: {
    style: {
      backgroundColor: 'transparent',
      color: 'inherit',
      borderTopStyle: 'solid',
      borderTopWidth: '1px',
      borderTopColor: 'rgba(122, 184, 122, 0.2)',
    },
    pageButtonsStyle: {
      color: 'inherit',
      fill: 'inherit',
    }
  },
};

// Custom Filter Component
const FilterComponent = ({ filterText, onFilter, onClear, t }) => (
    <div className="flex w-full sm:w-auto max-w-sm ml-auto mb-4 relative">
        <input
            id="search"
            type="text"
            className="w-full pl-4 pr-10 py-2 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 focus:border-transparent outline-none transition-all text-nature-800 dark:text-nature-100 shadow-sm"
            placeholder={t('searchPlaceholder') || "Search..."}
            aria-label="Search Input"
            value={filterText}
            onChange={onFilter}
        />
        {filterText && (
          <button 
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-nature-500 hover:text-nature-700 dark:text-nature-400 dark:hover:text-nature-200 rounded-full hover:bg-nature-100 dark:hover:bg-nature-800 transition-colors" 
            type="button" 
            onClick={onClear}
          >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        )}
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

    return (
        <div className="text-nature-800 dark:text-nature-100">
            <DataTable
                columns={columns}
                data={filteredItems}
                pagination
                paginationResetDefaultPage={resetPaginationToggle} // Reset page on new search
                subHeader
                subHeaderComponent={subHeaderComponentMemo}
                persistTableHead
                responsive
                theme="antigravity"
                customStyles={customStyles}
            />
        </div>
    );
};

export default DataTableBase;