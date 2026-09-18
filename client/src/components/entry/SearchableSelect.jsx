import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faSearch,
  faTimes,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import './SearchableSelect.css';

const SearchableSelect = ({
  options = [],
  value,
  onChange,
  name = '',
  placeholder,
  disabled = false
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    width: 0,
    willDropUp: false,
    maxListHeight: 220
  });

  const wrapperRef = useRef(null);
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);
  const optionsListRef = useRef(null);

  // Normalize options array
  const safeOptions = useMemo(() => {
    return Array.isArray(options) ? options : [];
  }, [options]);

  // Find currently selected item
  const selectedItem = useMemo(() => {
    return safeOptions.find(
      (opt) =>
        opt.code !== undefined &&
        opt.code !== null &&
        opt.code.toString() === (value ?? '').toString()
    );
  }, [safeOptions, value]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return safeOptions;
    const q = searchQuery.toLowerCase().trim();
    return safeOptions.filter((opt) => {
      const nameMatch = (opt.name || '').toLowerCase().includes(q);
      const codeMatch = (opt.code !== undefined && opt.code !== null ? opt.code.toString() : '').toLowerCase().includes(q);
      return nameMatch || codeMatch;
    });
  }, [safeOptions, searchQuery]);

  // Calculate viewport-aware position for dropdown menu portal
  const calculatePosition = () => {
    if (!wrapperRef.current) return null;
    const rect = wrapperRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedMenuHeight = 260;

    const willDropUp = spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow;

    let left = rect.left;
    let width = Math.max(rect.width, 240);

    // Prevent horizontal overflow off the right edge of viewport
    if (left + width > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - width - 12);
    }

    const availableSpace = willDropUp ? spaceAbove - 60 : spaceBelow - 60;
    const maxListHeight = Math.max(120, Math.min(240, availableSpace));

    return {
      top: Math.round(rect.bottom + 4),
      bottom: Math.round(window.innerHeight - rect.top + 4),
      left: Math.round(left),
      width: Math.round(width),
      willDropUp,
      maxListHeight
    };
  };

  // Toggle open / close
  const handleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      const pos = calculatePosition();
      if (pos) {
        setMenuPosition(pos);
      }
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    setSearchQuery('');
    setFocusedIndex(0);
  };

  // Reposition on scroll / resize while open
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      // If trigger is completely scrolled off screen, close
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        setIsOpen(false);
        return;
      }
      const pos = calculatePosition();
      if (pos) {
        setMenuPosition(pos);
      }
    };

    const handleScrollOrResize = (e) => {
      // If user is scrolling the dropdown list itself, do not reposition
      if (menuRef.current && menuRef.current.contains(e.target)) {
        return;
      }
      updatePosition();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Close when clicking outside both toggle and portal menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Scroll focused option into view
  useEffect(() => {
    if (isOpen && optionsListRef.current) {
      const activeEl = optionsListRef.current.children[focusedIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex, isOpen]);

  // Selection handler
  const handleSelect = (code) => {
    if (onChange) {
      onChange({
        target: {
          name,
          value: code
        }
      });
    }
    setIsOpen(false);
    setSearchQuery('');
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleOpen();
      }
      return;
    }

    if (e.key === 'Escape' || e.key === 'Tab') {
      if (e.key === 'Escape') e.preventDefault();
      setIsOpen(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) =>
        prev > 0 ? prev - 1 : Math.max(0, filteredOptions.length - 1)
      );
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length > 0 && filteredOptions[focusedIndex]) {
        handleSelect(filteredOptions[focusedIndex].code);
      }
    }
  };

  const displayText = selectedItem
    ? selectedItem.name
    : placeholder || t('selectPlaceholder') || 'Select...';

  // Dropdown menu content rendered into Portal
  const menuContent = isOpen ? (
    <div
      ref={menuRef}
      className={`searchable-select-menu ${menuPosition.willDropUp ? 'drop-up' : 'drop-down'}`}
      style={{
        position: 'fixed',
        top: menuPosition.willDropUp ? 'auto' : `${menuPosition.top}px`,
        bottom: menuPosition.willDropUp ? `${menuPosition.bottom}px` : 'auto',
        left: `${menuPosition.left}px`,
        width: `${menuPosition.width}px`,
        zIndex: 99999
      }}
    >
      {/* Search Header */}
      <div className="searchable-select-search-wrap">
        <div className="searchable-select-search-box">
          <FontAwesomeIcon icon={faSearch} className="searchable-select-search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="searchable-select-search-input"
            placeholder={t('searchPlaceholder') || 'தேடுக... / Type to filter...'}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setFocusedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          {searchQuery && (
            <button
              type="button"
              className="searchable-select-clear-btn"
              onClick={() => {
                setSearchQuery('');
                setFocusedIndex(0);
                searchInputRef.current?.focus();
              }}
              aria-label="Clear filter"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
      </div>

      {/* Options List */}
      <ul
        id={`searchable-select-list-${name || 'field'}`}
        ref={optionsListRef}
        className="searchable-select-options-list"
        style={{ maxHeight: `${menuPosition.maxListHeight || 220}px` }}
        role="listbox"
      >
        {filteredOptions.map((opt, index) => {
          const isSelected =
            value !== undefined &&
            value !== null &&
            opt.code?.toString() === value?.toString();
          const isFocused = index === focusedIndex;

          return (
            <li
              key={opt.code}
              className={`searchable-select-option ${isFocused ? 'is-focused' : ''} ${isSelected ? 'is-selected' : ''}`}
              onClick={() => handleSelect(opt.code)}
              onMouseEnter={() => setFocusedIndex(index)}
              role="option"
              aria-selected={isSelected}
            >
              <span className="searchable-select-option-text">{opt.name}</span>
              {isSelected && (
                <FontAwesomeIcon
                  icon={faCheck}
                  className="searchable-select-option-check"
                />
              )}
            </li>
          );
        })}

        {filteredOptions.length === 0 && (
          <li className="searchable-select-empty">
            {t('noResults') || 'பொருத்தமான தகவல்கள் இல்லை / No results found'}
          </li>
        )}
      </ul>
    </div>
  ) : null;

  return (
    <div className="searchable-select-wrapper" ref={wrapperRef}>
      {/* Toggle Button */}
      <div
        className={`searchable-select-toggle ${isOpen ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''}`}
        tabIndex={disabled ? -1 : 0}
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`searchable-select-list-${name || 'field'}`}
      >
        <span className={`searchable-select-label ${!selectedItem ? 'placeholder-text' : ''}`}>
          {displayText}
        </span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`searchable-select-arrow ${isOpen ? 'arrow-up' : ''}`}
        />
      </div>

      {/* Portal Dropdown Menu attached to document.body to prevent clipping */}
      {isOpen && typeof document !== 'undefined' && ReactDOM.createPortal(menuContent, document.body)}
    </div>
  );
};

export { SearchableSelect };
export default SearchableSelect;