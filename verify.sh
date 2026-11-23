#!/usr/bin/env bash
set -e

# ==============================================================================
# ScanBeforeEat — Comprehensive Full-Stack Verification Script
# Runs all server tests, frontend tests, and production builds from the root.
# ==============================================================================

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

START_TIME=$(date +%s)

echo -e "\n${BOLD}${CYAN}======================================================${NC}"
echo -e "${BOLD}${CYAN}   ScanBeforeEat — Full-Stack Verification Suite     ${NC}"
echo -e "${BOLD}${CYAN}======================================================${NC}\n"

# Step 1: Server Tests
echo -e "${YELLOW}[1/4] Running Server Test Suites...${NC}"
npm --prefix server test
echo -e "${GREEN}✓ Server tests passed cleanly.${NC}\n"

# Step 2: Frontend Tests
echo -e "${YELLOW}[2/4] Running Frontend Test Suites...${NC}"
npm --prefix frontend test
echo -e "${GREEN}✓ Frontend tests passed cleanly.${NC}\n"

# Step 3: Frontend Turbopack Build
echo -e "${YELLOW}[3/4] Running Frontend Production Build (Turbopack)...${NC}"
npm --prefix frontend run build
echo -e "${GREEN}✓ Frontend build succeeded.${NC}\n"

# Step 4: Server TypeScript Build
echo -e "${YELLOW}[4/4] Running Server TypeScript Build (tsc)...${NC}"
npm --prefix server run build
echo -e "${GREEN}✓ Server build succeeded.${NC}\n"

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo -e "${BOLD}${GREEN}======================================================${NC}"
echo -e "${BOLD}${GREEN}   ✓ ALL VERIFICATION CHECKS PASSED (${DURATION}s)           ${NC}"
echo -e "${BOLD}${GREEN}   Application is verified and production-ready!      ${NC}"
echo -e "${BOLD}${GREEN}======================================================${NC}\n"
