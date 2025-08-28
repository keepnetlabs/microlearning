// Static CSS classes - Component dışında tanımlandı çünkü hiç değişmiyor
export const STATIC_CSS_CLASSES = {
  // Loading overlay
  loadingOverlay: "fixed inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center transition-colors duration-300",
  loadingText: "text-sm font-medium text-[#1C1C1E] dark:text-[#F2F2F7]",
  loadingSpinner: "animate-spin text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300",
  loadingContainer: "flex items-center justify-center space-x-3",
  // Background
  backgroundContainer: "fixed inset-0 pointer-events-none overflow-hidden",
  // Header
  headerContainer: "relative shrink-0",
  headerContent: "relative z-10 px-4 pt-4 pb-3 lg:px-16 xl:px-20 2xl:px-24 min-h-[72px]",
  // Controls
  controlsContainer: "flex items-center sm:space-x-1.5 md:space-x-3 flex-shrink-0 z-20",
  // Points badge
  pointsBadge: "relative flex items-center justify-center min-w-[54px] sm:min-w-[70px] space-x-1 sm:space-x-1.5 md:space-x-1.5 px-1.5 sm:px-2 md:px-3 h-8 sm:h-10 rounded-md sm:rounded-lg md:rounded-xl overflow-hidden transition-all duration-500 glass-border-3 ease-out group",
  pointsBadgeNoise: "absolute inset-0 opacity-[0.020] dark:opacity-[0.012] rounded-lg sm:rounded-xl mix-blend-overlay pointer-events-none",
  pointsText: "text-xs md:text-sm font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300",
  // Theme button
  themeButton: "relative glass-border-3 flex items-center justify-center p-1.5 md:p-2 h-[32px] sm:h-[40px] sm:max-h-[40px] rounded-md sm:rounded-lg md:rounded-xl overflow-hidden transition-all duration-500 ease-out group ",
  themeButtonIcon: "w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300",
  // Language button
  languageButton: "relative flex items-center justify-center space-x-0.5 sm:rounded-xl sm:space-x-1 md:space-x-2 px-1 sm:px-1.5 md:px-3 h-8 sm:h-10 w-[56px] sm:w-[100px] sm:rounded-lg md:rounded-xl overflow-hidden transition-all duration-500 ease-out group",
  languageFlag: "w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 rounded-sm",
  languageText: "text-xs md:text-sm font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300",
  languageChevron: "w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-[#1C1C1E] dark:text-[#F2F2F7] transition-all duration-300",
  // Language dropdown
  languageDropdown: "absolute right-0 mt-2 bg-white dark:bg-gray-800 glass-border-2 rounded-xl shadow-xl z-50 min-w-[200px] max-h-80 overflow-y-auto",
  languageDropdownItem: "flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors",
  languageDropdownItemActive: "bg-blue-50 dark:bg-blue-900/50",
  languageDropdownItemText: "text-sm font-medium text-gray-900 dark:text-gray-100",
  languageSearch: "w-full px-3 py-2 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-[#1C1C1E] dark:text-[#F2F2F7] placeholder-gray-500 dark:placeholder-gray-400",
  languageList: "max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent",
  languageItem: "flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer",
  languageItemText: "text-sm text-[#1C1C1E] dark:text-[#F2F2F7]",
  languageItemFlag: "w-4 h-4 rounded-sm",
  // Search
  searchContainer: "sticky top-0 bg-white dark:bg-gray-800 px-3 py-2 border-b border-gray-200 dark:border-gray-700",
  searchInput: "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500",
  // Main content
  mainContent: "relative flex-1 flex flex-col",
  // Scene container
  sceneContainer: "relative flex-1 overflow-hidden",
  // Navigation
  navigationContainer: "relative shrink-0 z-10",
  navigationContent: "px-4 pb-4 lg:px-16 xl:px-20 2xl:px-24",
  // Nav buttons
  navButtonsContainer: "flex items-center justify-between space-x-4",
  // Content area
  contentContainer: "flex-1 relative z-10 overflow-hidden",
  // Achievement notification
  achievementNotification: "fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2",
  achievementIcon: "w-6 h-6 text-white",
  achievementText: "font-semibold text-white",
  achievementContainer: "fixed top-24 right-4 z-40",
  achievementContent: "relative px-4 py-2 glass-border-1 text-sm text-[#1C1C1E] dark:text-[#F2F2F7] group",
  achievementClose: "ml-2 p-1 rounded-full text-[#1C1C1E] dark:text-[#F2F2F7]",
  // Navigation
  navContainer: "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30",
  navButtonIcon: "w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300",
  // Quiz completion notification
  quizNotificationContainer: "fixed z-30 bottom-4 right-4 sm:bottom-6 sm:right-6",
  quizNotificationContent: "relative px-4 py-2 glass-border-1 text-sm text-[#1C1C1E] dark:text-[#F2F2F7] group",
  quizNotificationClose: "ml-1 p-1 rounded-full hover:bg-amber-200/50 dark:hover:bg-amber-900/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:focus:ring-amber-600/30 opacity-60",
  // Scroll indicator
  scrollIndicator: "fixed right-4 top-1/2 transform -translate-y-1/2 z-40 flex flex-col space-y-2",
  scrollToTop: "fixed bottom-4 right-4 z-40 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full p-3 shadow-lg hover:bg-white/30 transition-all duration-300 cursor-pointer",
  scrollToTopIcon: "w-6 h-6 text-gray-700 dark:text-gray-300"
};