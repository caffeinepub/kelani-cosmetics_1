# Manual Verification: Internet Identity Login on Production Domains

## Purpose
This document provides a manual QA checklist to verify that Internet Identity authentication works correctly on both production domain variations after deploying the `.well-known/ii-alternative-origins` file.

## Prerequisites
- The application must be deployed to production
- The `.well-known/ii-alternative-origins` file must be accessible at both domains
- You need an Internet Identity for testing

## Verification Checklist

### Domain 1: http://kelanicosmetics.es

#### Step 1: Access the Application
- [ ] Navigate to `http://kelanicosmetics.es` in your browser
- [ ] Verify the homepage loads correctly

#### Step 2: Navigate to Admin Login
- [ ] Click on the hamburger menu or navigate to `/admin`
- [ ] Verify the login page is displayed

#### Step 3: Initiate Internet Identity Login
- [ ] Click the "Login" button
- [ ] Verify you are redirected to the Internet Identity service
- [ ] Complete the authentication process with your Internet Identity

#### Step 4: Verify Authentication Success
- [ ] Verify you are redirected back to `http://kelanicosmetics.es/admin`
- [ ] Verify the application recognizes your authenticated principal
- [ ] Check that your user profile or admin status is displayed correctly
- [ ] Verify you can access protected admin features

#### Step 5: Test Logout
- [ ] Click the logout button
- [ ] Verify you are logged out successfully
- [ ] Verify you cannot access protected routes after logout

---

### Domain 2: http://www.kelanicosmetics.es

#### Step 1: Access the Application
- [ ] Navigate to `http://www.kelanicosmetics.es` in your browser
- [ ] Verify the homepage loads correctly

#### Step 2: Navigate to Admin Login
- [ ] Click on the hamburger menu or navigate to `/admin`
- [ ] Verify the login page is displayed

#### Step 3: Initiate Internet Identity Login
- [ ] Click the "Login" button
- [ ] Verify you are redirected to the Internet Identity service
- [ ] Complete the authentication process with your Internet Identity

#### Step 4: Verify Authentication Success
- [ ] Verify you are redirected back to `http://www.kelanicosmetics.es/admin`
- [ ] Verify the application recognizes your authenticated principal
- [ ] Check that your user profile or admin status is displayed correctly
- [ ] Verify you can access protected admin features

#### Step 5: Test Logout
- [ ] Click the logout button
- [ ] Verify you are logged out successfully
- [ ] Verify you cannot access protected routes after logout

---

## Cross-Domain Session Verification

### Test Principal Consistency
- [ ] Log in on `http://kelanicosmetics.es`
- [ ] Note your principal ID (visible in admin panel or user profile)
- [ ] Log out
- [ ] Log in on `http://www.kelanicosmetics.es` with the same Internet Identity
- [ ] Verify the principal ID matches the one from the first domain
- [ ] Verify your admin status and permissions are consistent across both domains

---

## Common Issues and Troubleshooting

### Issue: "Unauthorized origin" error during login
**Cause**: The `.well-known/ii-alternative-origins` file is not accessible or contains incorrect domains.

**Solution**:
1. Verify the file is accessible at `http://kelanicosmetics.es/.well-known/ii-alternative-origins`
2. Verify the file is accessible at `http://www.kelanicosmetics.es/.well-known/ii-alternative-origins`
3. Check that the JSON content matches exactly:
   ```json
   {
     "alternativeOrigins": [
       "http://kelanicosmetics.es",
       "http://www.kelanicosmetics.es"
     ]
   }
   ```
4. Ensure there are no trailing slashes in the domain URLs
5. Verify the protocol is `http://` (not `https://`) if your domains use HTTP

### Issue: Different principal IDs on different domains
**Cause**: The alternative origins file is not properly configured or the domains are not recognized as equivalent by Internet Identity.

**Solution**:
1. Clear browser cache and cookies
2. Verify both domains are listed in the alternative origins file
3. Re-deploy the application and test again

### Issue: Login works on one domain but not the other
**Cause**: The `.well-known/ii-alternative-origins` file may not be accessible on one of the domains.

**Solution**:
1. Test file accessibility on both domains using curl or browser
2. Check web server configuration for both domains
3. Verify DNS and routing are correctly configured

---

## Notes
- The Internet Identity service caches the alternative origins file, so changes may take a few minutes to propagate
- Always test with a fresh browser session or incognito mode to avoid cached authentication state
- Document any issues encountered during testing for future reference
- Update the domain URLs in the alternative origins file if your production domains change

## Sign-off
- [ ] All verification steps completed successfully on both domains
- [ ] No authentication errors encountered
- [ ] Principal consistency verified across domains
- [ ] Logout functionality works correctly on both domains

**Tester Name**: ___________________________  
**Date**: ___________________________  
**Notes**: ___________________________
