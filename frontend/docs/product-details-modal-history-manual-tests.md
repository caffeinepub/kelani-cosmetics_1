# Product Details Modal History Navigation - Manual QA Checklist

## Overview
This document provides manual test scenarios to validate the product details modal navigation behavior across all public pages, ensuring proper back button functionality and single-click close button operation.

## Test Environment
- Test on both desktop and mobile browsers
- Test on Chrome, Firefox, Safari, and Edge
- Test on Android physical back button

## Scenario 1: Homepage Product Card Click (Category Sections)

### Steps:
1. Navigate to the homepage
2. Scroll to a category section (e.g., "Cuidado del Cabello")
3. Click on a product card within the category section to open the modal
4. **Verify**: Modal opens immediately, URL remains at homepage "/"
5. **Verify**: History state is pushed (check browser dev tools: window.history.state should contain modalOpen: true, source: 'homepage-category')
6. Press the browser back button once
7. **Verify**: Modal closes immediately with a single back press
8. **Verify**: Still on homepage, scroll position preserved
9. Press the browser back button again
10. **Verify**: Navigate to the previous page (not homepage)

### Expected Results:
- ✅ Modal opens without changing URL
- ✅ History state pushed with modalOpen: true and source: 'homepage-category'
- ✅ Single back press closes modal
- ✅ Homepage scroll position preserved after modal closes
- ✅ Second back press navigates away from homepage

### Alternative Close Methods:
1. Open modal from homepage category section
2. Click the close button (X) in the top-right corner once
3. **Verify**: Modal closes immediately with a single click
4. Open modal again from homepage category section
5. Press ESC key
6. **Verify**: Modal closes immediately
7. Open modal again from homepage category section
8. Click the overlay (outside modal content)
9. **Verify**: Modal closes immediately

## Scenario 2: Homepage Search Result Click

### Steps:
1. Navigate to the homepage
2. Type a search query in the search bar (at least 2 characters)
3. Wait for search results to appear in dropdown
4. Click on a search result to open the modal
5. **Verify**: Modal opens, search dropdown closes, URL remains at homepage "/"
6. **Verify**: History state contains modalOpen: true and source: 'homepage-search'
7. Press the browser back button once
8. **Verify**: Modal closes, homepage visible, scroll position preserved
9. Press the browser back button again
10. **Verify**: Navigate to previous page

### Expected Results:
- ✅ Modal opens from search results
- ✅ History state pushed with correct source identifier
- ✅ Single back press closes modal
- ✅ Second back press navigates away
- ✅ Search context cleared after modal closes

## Scenario 3: Category Page Product Card Click

### Steps:
1. Navigate to the homepage
2. Click "Ver todos" on a category section to go to the category page
3. Click on a product card to open the modal
4. **Verify**: Modal opens, URL remains on category page
5. **Verify**: History state contains modalOpen: true and source: 'category-page'
6. Press the browser back button once
7. **Verify**: Modal closes, still on category page
8. Press the browser back button again
9. **Verify**: Navigate back to homepage

### Expected Results:
- ✅ Modal opens without changing category page URL
- ✅ Single back press closes modal
- ✅ Second back press navigates to previous page
- ✅ Scroll position preserved on category page

## Scenario 4: Multiple Modal Interactions from Different Sources

### Steps:
1. Navigate to the homepage
2. Click a product card in a category section to open modal
3. Click the close button (X) once
4. **Verify**: Modal closes immediately
5. Type in search bar and click a search result to open modal
6. Press ESC key
7. **Verify**: Modal closes immediately
8. Scroll to another category section and click a product card
9. Click the overlay (outside modal content)
10. **Verify**: Modal closes immediately
11. Press back button
12. **Verify**: Navigate to previous page (no extra back presses needed)

### Expected Results:
- ✅ Close button works in one click every time
- ✅ ESC key closes modal immediately
- ✅ Overlay click closes modal immediately
- ✅ History stack remains clean (no phantom entries)
- ✅ Single back press navigates away after all modals closed
- ✅ Consistent behavior across all modal entry points

## Scenario 5: Rapid Interactions

### Steps:
1. Open a product modal from homepage category section
2. Rapidly click the close button multiple times
3. **Verify**: No errors, modal closes cleanly
4. Open another modal from homepage category section
5. Rapidly press ESC key multiple times
6. **Verify**: No errors, modal closes cleanly
7. Open another modal from homepage category section
8. Rapidly press back button multiple times
9. **Verify**: No errors, modal closes and navigates cleanly
10. Check browser console
11. **Verify**: No JavaScript errors

### Expected Results:
- ✅ No console errors
- ✅ No duplicate history entries
- ✅ Clean navigation behavior
- ✅ No stuck modal states

## Scenario 6: Mobile Physical Back Button (Android)

### Steps:
1. On Android device, navigate to homepage
2. Scroll to a category section
3. Open a product modal from category section
4. Press the physical back button
5. **Verify**: Modal closes, stays on homepage with scroll preserved
6. Press the physical back button again
7. **Verify**: Navigate to previous page

### Expected Results:
- ✅ Physical back button closes modal
- ✅ Second press navigates away
- ✅ Touch interactions work smoothly
- ✅ Scroll position preserved

## Scenario 7: Forward Navigation

### Steps:
1. Navigate to homepage
2. Scroll to a category section
3. Open a product modal from category section
4. Press back button (modal closes)
5. **Verify**: Modal closed, on homepage
6. Press forward button
7. **Verify**: History state restored (modal may not reopen due to data limitations, but no errors)
8. Press back button again
9. **Verify**: Navigate back cleanly

### Expected Results:
- ✅ Forward button navigates forward in history
- ✅ Back button still works after forward navigation
- ✅ No infinite loops or stuck states
- ✅ No console errors

## Scenario 8: Cross-Source Regression Testing

### Steps:
1. Test modal open/close from homepage category section (Scenario 1)
2. **Verify**: Single back press closes modal
3. Test modal open/close from homepage search (Scenario 2)
4. **Verify**: Single back press closes modal
5. Navigate to a category page
6. Test modal open/close from category page product grid (Scenario 3)
7. **Verify**: Single back press closes modal
8. Switch between different sources in same session
9. **Verify**: Consistent behavior across all sources

### Expected Results:
- ✅ Homepage category section: back button closes modal
- ✅ Homepage search: back button closes modal
- ✅ Category page: back button closes modal
- ✅ No regressions in existing functionality
- ✅ Consistent behavior across all entry points

## Scenario 9: Scroll Position Preservation

### Steps:
1. Navigate to homepage
2. Scroll down to a category section near the bottom
3. Note the scroll position
4. Click a product card to open modal
5. Scroll within the modal (if content is scrollable)
6. Press back button to close modal
7. **Verify**: Homepage scroll position is exactly where it was before opening modal
8. Repeat with different scroll positions
9. **Verify**: Scroll position always preserved

### Expected Results:
- ✅ Homepage scroll position preserved after modal closes via back button
- ✅ Homepage scroll position preserved after modal closes via close button
- ✅ Homepage scroll position preserved after modal closes via ESC key
- ✅ Homepage scroll position preserved after modal closes via overlay click

## Common Issues to Watch For

### ❌ Issues that should NOT occur:
- Close button requiring two clicks
- Multiple back presses needed to navigate away
- Modal not closing on back button press from homepage category cards
- URL changing when modal opens from homepage
- Console errors during navigation
- Scroll position lost after closing modal
- History stack corruption (extra phantom entries)
- Infinite loops when using back/forward
- Modal reopening unexpectedly
- Different behavior between homepage category cards vs search vs category page

### ✅ Expected Behavior:
- Single click closes modal every time
- Single back press closes modal when open (from any source)
- URL never changes when modal opens/closes from homepage
- Scroll position preserved on homepage
- Clean history stack with proper state objects
- No console errors
- Consistent behavior across all entry points (homepage category, homepage search, category page)
- Spanish interface unchanged
- History state includes modalOpen: true and source identifier

## Browser Compatibility

Test on:
- ✅ Chrome (desktop & mobile)
- ✅ Firefox (desktop & mobile)
- ✅ Safari (desktop & mobile)
- ✅ Edge (desktop)
- ✅ Android Chrome (physical back button)

## Desktop vs Mobile Viewport Testing

### Desktop (>768px):
- Test all scenarios at desktop viewport
- Verify 5 products shown per category section
- Verify modal layout and interactions

### Mobile (≤768px):
- Test all scenarios at mobile viewport
- Verify 4 products shown per category section (2x2 grid)
- Verify modal layout and touch interactions
- Test physical back button on Android devices

## Notes

- All tests should pass on both light and dark themes
- Spanish text should remain unchanged throughout
- No backend modifications should be required
- All existing modal functionality should be preserved
- History state should always include modalOpen: true and source identifier
- Source identifiers: 'homepage-category', 'homepage-search', 'category-page'
