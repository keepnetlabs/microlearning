import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';
import { STATIC_CSS_CLASSES } from '../utils/cssClasses';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface LanguageSelectorProps {
  currentLanguage: Language | null;
  selectedLanguage: string;
  isDropdownOpen: boolean;
  isMobile: boolean;
  searchTerm: string;
  filteredLanguages: Language[];
  dropdownRef: React.RefObject<HTMLDivElement>;
  onDropdownToggle: () => void;
  onLanguageChange: (code: string) => void;
  onSearchChange: (term: string) => void;
  getCountryCode: (code: string) => string;
  ariaLabels?: {
    selectorLabel?: string;
    selectorDescription?: string;
    listLabel?: string;
    listDescription?: string;
    searchDescription?: string;
  };
  texts?: {
    languageNotFound?: string;
  };
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  selectedLanguage,
  isDropdownOpen,
  isMobile,
  searchTerm,
  filteredLanguages,
  dropdownRef,
  onDropdownToggle,
  onLanguageChange,
  onSearchChange,
  getCountryCode,
  ariaLabels = {},
  texts = {}
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input when dropdown opens
  React.useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      const timer = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          if (searchInputRef.current.value) {
            searchInputRef.current.select();
          }
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isDropdownOpen]);

  const handleLanguageSelect = (languageCode: string) => {
    onLanguageChange(languageCode);
    onSearchChange('');
  };

  return (
    <div
      className="relative"
      ref={dropdownRef}
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={isDropdownOpen}
      aria-controls="language-dropdown-list"
    >
      <motion.button
        onClick={onDropdownToggle}
        className={`${STATIC_CSS_CLASSES.languageButton} ${!isMobile ? 'glass-border-3' : 'glass-border-4'}`}
        whileHover={{
          scale: 1.02,
          y: -1
        }}
        whileTap={{ scale: 0.98 }}
        aria-label={ariaLabels.selectorLabel || "Language selector"}
        aria-expanded={isDropdownOpen}
        aria-describedby="language-selector-description"
        style={{
          transform: 'translateZ(0)',
          willChange: 'transform',
          touchAction: 'manipulation'
        }}
        data-testid="language-button"
      >
        {/* Content */}
        <div className="relative z-10 flex items-center space-x-0.5 sm:space-x-1 md:space-x-2">
          <ReactCountryFlag
            countryCode={getCountryCode(currentLanguage?.code || 'tr')}
            svg
            style={{ fontSize: isMobile ? '1rem' : '1.2rem' }}
            aria-hidden="true"
          />
          <span className="text-[14px] text-[#1C1C1E] dark:text-[#F2F2F7] font-semibold transition-colors duration-300">
            {getCountryCode(currentLanguage?.code || 'tr')}
          </span>
          <ChevronDown
            size={8}
            className={`${STATIC_CSS_CLASSES.languageChevron} hidden sm:block`}
            style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            aria-hidden="true"
          />
        </div>
        {/* Hidden description for screen readers */}
        <div id="language-selector-description" className="sr-only">
          {ariaLabels.selectorDescription || "Select your preferred language for the application"}
        </div>
      </motion.button>

      {/* Enhanced Language Dropdown */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`glass-border-2 absolute top-full right-0 mt-2 w-64 sm:w-72 rounded-2xl z-50 overflow-hidden transition-colors duration-300`}
            role="listbox"
            id="language-dropdown-list"
            aria-label={ariaLabels.listLabel || "Language Selector"}
            aria-describedby="language-list-description"
            style={{
              position: 'absolute'
            }}
          >
            {/* Enhanced Search Input */}
            <div className="relative p-2.5 border-b transition-colors duration-300">
              <div
                className="relative glass-border-2 cursor-text"
                onClick={() => searchInputRef.current?.focus()}
              >
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#1C1C1E] dark:text-[#F2F2F7] pointer-events-none z-10">
                  <Search size={12} />
                </span>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className={`w-full pl-6 pr-3 py-1.5 bg-transparent text-xs rounded-lg placeholder-[#1C1C1E] dark:placeholder-[#F2F2F7] text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:ring-inset`}
                  aria-label="..."
                  aria-describedby="language-search-description"
                  role="searchbox"
                  onFocus={(e) => e.target.select()}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  inputMode="search"
                  name="language_search"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-bwignore="true"
                />
                {/* Hidden description for search input */}
                <div id="language-search-description" className="sr-only">
                  {ariaLabels.searchDescription}
                </div>
              </div>
            </div>

            {/* Enhanced Language List */}
            <div
              className={STATIC_CSS_CLASSES.languageList}
              style={{
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y'
              }}
              role="listbox"
              aria-label="Available languages"
            >
              {/* Hidden description for screen readers */}
              <div id="language-list-description" className="sr-only">
                {ariaLabels.listDescription || "List of available languages for the application"}
              </div>
              {filteredLanguages.length === 0 ? (
                <div className="px-3 py-2 text-xs text-[#1C1C1E] dark:text-[#F2F2F7] text-center transition-colors duration-300">
                  {texts.languageNotFound}
                </div>
              ) : (
                <>
                  {/*Languages */}
                  {searchTerm ? (
                    // Show all filtered results when searching
                    filteredLanguages.map((language, index) => (
                      <motion.button
                        key={`search-${language.code}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(index * 0.01, 0.2) }}
                        onClick={() => handleLanguageSelect(language.code)}
                        className={`relative z-10 w-full flex items-center space-x-2.5 px-3 py-3 text-left transition-all duration-200 focus:outline-none`}
                        style={{ touchAction: 'manipulation' }}
                        role="option"
                        aria-selected={selectedLanguage === language.code}
                      >
                        <span className="text-xs">{language.flag}</span>
                        <span className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7] font-medium flex-1 min-w-0 truncate transition-colors duration-300">
                          {language.name}
                        </span>
                        <span className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7] flex-shrink-0 transition-colors duration-300">
                          {language.code.toUpperCase()}
                        </span>
                      </motion.button>
                    ))
                  ) : (
                    // Show other languages when not searching
                    filteredLanguages.map((language, index) => (
                      <motion.button
                        key={`other-${language.code}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.01 }}
                        onClick={() => handleLanguageSelect(language.code)}
                        className={`relative z-10 w-full flex items-center space-x-2.5 px-3 py-3 text-left transition-all duration-200 focus:outline-none`}
                        style={{ touchAction: 'manipulation' }}
                        role="option"
                        aria-selected={selectedLanguage === language.code}
                      >
                        <ReactCountryFlag
                          countryCode={getCountryCode(language.code)}
                          svg
                          style={{ fontSize: '0.75rem' }}
                        />
                        <span className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7] font-medium flex-1 min-w-0 truncate transition-colors duration-300">
                          {language.name}
                        </span>
                        <span className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7] flex-shrink-0 transition-colors duration-300">
                          {getCountryCode(language.code)}
                        </span>
                        {selectedLanguage === language.code && (
                          <div className="w-1 h-1 bg-[#1C1C1E] dark:bg-[#F2F2F7] rounded-full flex-shrink-0"></div>
                        )}
                      </motion.button>
                    ))
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};