#!/bin/bash

# MAIA LabTools + IPP - Unified Platform Deployment Script
# Builds and deploys to PWA, Desktop (Electron), and Mobile (iOS/Android) platforms

set -e # Exit on any error

echo "🚀 MAIA LabTools + IPP - Unified Platform Deployment"
echo "=================================================="
echo ""
echo "📱 Platforms: PWA + Desktop + iOS + Android"
echo "🔬 Features: Consciousness monitoring, biometrics, IPP clinical assessments"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status messages
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to restore disabled routes after successful build
restore_routes() {
    if [ -d "temp-disabled-routes/backend" ]; then
        print_status "Restoring temporarily disabled backend routes..."
        mv temp-disabled-routes/backend app/api/
        rmdir temp-disabled-routes 2>/dev/null || true
        print_success "Backend routes restored"
    fi
}

# Function to cleanup on error (without restoring problematic routes)
cleanup_on_error() {
    print_warning "Build failed - leaving backend routes disabled to prevent interference"
    print_status "To manually restore: mv temp-disabled-routes/backend app/api/"
}

# Set up trap for error cleanup only
trap cleanup_on_error ERR

# Parse command line arguments
BUILD_PWA=true
BUILD_DESKTOP=false
BUILD_IOS=false
BUILD_ANDROID=false
OPEN_APPS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --desktop)
            BUILD_DESKTOP=true
            shift
            ;;
        --ios)
            BUILD_IOS=true
            shift
            ;;
        --android)
            BUILD_ANDROID=true
            shift
            ;;
        --mobile)
            BUILD_IOS=true
            BUILD_ANDROID=true
            shift
            ;;
        --all)
            BUILD_DESKTOP=true
            BUILD_IOS=true
            BUILD_ANDROID=true
            shift
            ;;
        --open)
            OPEN_APPS=true
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --desktop    Build Electron desktop app"
            echo "  --ios        Build iOS app"
            echo "  --android    Build Android app"
            echo "  --mobile     Build both iOS and Android"
            echo "  --all        Build all platforms"
            echo "  --open       Open native IDEs after building"
            echo "  --help       Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                    # Build PWA only"
            echo "  $0 --desktop --open   # Build PWA + Desktop and open Electron"
            echo "  $0 --mobile          # Build PWA + iOS + Android"
            echo "  $0 --all --open      # Build everything and open IDEs"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Verify required tools are installed
print_status "Checking required dependencies..."

if ! command_exists npm; then
    print_error "npm is required but not installed"
    exit 1
fi

if ! command_exists node; then
    print_error "Node.js is required but not installed"
    exit 1
fi

if [ "$BUILD_DESKTOP" = true ] && ! command_exists electron; then
    print_warning "Electron not found globally, will use npx"
fi

if [ "$BUILD_IOS" = true ] && ! command_exists xcodebuild; then
    print_error "Xcode is required for iOS builds but not found"
    exit 1
fi

if [ "$BUILD_ANDROID" = true ] && ! command_exists gradle; then
    print_warning "Gradle not found globally, will use wrapper"
fi

if ([ "$BUILD_IOS" = true ] || [ "$BUILD_ANDROID" = true ]) && ! command_exists npx; then
    print_error "npx is required for mobile builds but not found"
    exit 1
fi

print_success "Dependencies check passed"

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf .next www dist electron-dist 2>/dev/null || true
print_success "Previous builds cleaned"

# Step 1: Build PWA
print_status "Building PWA with IPP integration..."
echo "  ├── Next.js static export mode"
echo "  ├── Capacitor-compatible output"
echo "  └── IPP clinical assessment integration"

export CAPACITOR_BUILD=true
if npm run build; then
    print_success "PWA build completed successfully"
    echo "  ├── Generated static pages: $(find www -name "*.html" | wc -l | xargs)"
    echo "  ├── PWA assets ready in www/"
    echo "  └── IPP routes: /api/clinical/ipp/*"
else
    print_error "PWA build failed"
    exit 1
fi

# Step 2: Copy to mobile platforms if building mobile
if [ "$BUILD_IOS" = true ] || [ "$BUILD_ANDROID" = true ]; then
    print_status "Copying web assets to native platforms..."
    if npx cap copy; then
        print_success "Assets copied to native platforms"
        if [ "$BUILD_IOS" = true ]; then
            echo "  ├── iOS: ios/App/App/public/"
        fi
        if [ "$BUILD_ANDROID" = true ]; then
            echo "  └── Android: android/app/src/main/assets/public/"
        fi
    else
        print_error "Failed to copy assets to mobile platforms"
        exit 1
    fi
fi

# Step 3: Build Desktop App
if [ "$BUILD_DESKTOP" = true ]; then
    print_status "Building Electron desktop app..."
    echo "  ├── Platform: macOS, Windows, Linux"
    echo "  ├── Features: Native menus, file operations"
    echo "  └── IPP integration: Full desktop experience"

    if npm run desktop:package; then
        print_success "Desktop app build completed"
        echo "  └── Output: electron-dist/"

        if [ "$OPEN_APPS" = true ]; then
            print_status "Opening Electron app..."
            if [ -f "electron-dist/mac/MAIA LabTools + IPP.app" ]; then
                open "electron-dist/mac/MAIA LabTools + IPP.app"
            elif [ -f "dist/MAIA LabTools + IPP.exe" ]; then
                start "dist/MAIA LabTools + IPP.exe"
            else
                print_warning "Desktop app built but executable not found in expected location"
            fi
        fi
    else
        print_error "Desktop app build failed"
        exit 1
    fi
fi

# Step 4: Build iOS App
if [ "$BUILD_IOS" = true ]; then
    print_status "Building iOS app..."
    echo "  ├── Platform: iOS 14+"
    echo "  ├── Features: HealthKit, biometric monitoring"
    echo "  └── IPP: Mobile clinical assessments"

    if npx cap sync ios && npx cap build ios; then
        print_success "iOS app build completed"
        echo "  └── Ready for Xcode: ios/App/"

        if [ "$OPEN_APPS" = true ]; then
            print_status "Opening Xcode workspace..."
            npx cap open ios
        fi
    else
        print_error "iOS app build failed"
        exit 1
    fi
fi

# Step 5: Build Android App
if [ "$BUILD_ANDROID" = true ]; then
    print_status "Building Android app..."
    echo "  ├── Platform: Android 7+ (API 24+)"
    echo "  ├── Features: Bluetooth LE, biometric sensors"
    echo "  └── IPP: Mobile clinical assessments"

    if npx cap sync android && npx cap build android; then
        print_success "Android app build completed"
        echo "  └── Ready for Android Studio: android/"

        if [ "$OPEN_APPS" = true ]; then
            print_status "Opening Android Studio..."
            npx cap open android
        fi
    else
        print_error "Android app build failed"
        exit 1
    fi
fi

# Build Summary
echo ""
print_success "🎉 MAIA LabTools + IPP Deployment Summary"
echo "=========================================="
echo ""
echo "✅ PWA: Ready for deployment"
echo "   └── Static files: www/"

if [ "$BUILD_DESKTOP" = true ]; then
    echo "✅ Desktop: Ready for distribution"
    echo "   └── Executables: electron-dist/"
fi

if [ "$BUILD_IOS" = true ]; then
    echo "✅ iOS: Ready for App Store"
    echo "   └── Xcode project: ios/App/"
fi

if [ "$BUILD_ANDROID" = true ]; then
    echo "✅ Android: Ready for Play Store"
    echo "   └── Android project: android/"
fi

echo ""
echo "🔬 IPP Clinical Features Available:"
echo "   ├── 5-element framework assessments"
echo "   ├── Conversation-based evaluations"
echo "   ├── Real-time biometric integration"
echo "   └── Professional documentation tools"
echo ""

# Next Steps
echo "📋 Next Steps:"
echo "   ├── PWA: Deploy www/ to your web server"
if [ "$BUILD_DESKTOP" = true ]; then
    echo "   ├── Desktop: Distribute electron-dist/ executables"
fi
if [ "$BUILD_IOS" = true ]; then
    echo "   ├── iOS: Open ios/App/ in Xcode for App Store submission"
fi
if [ "$BUILD_ANDROID" = true ]; then
    echo "   └── Android: Open android/ in Android Studio for Play Store submission"
fi

# Restore backend routes now that all builds are successful
restore_routes

echo ""
print_success "🌟 All requested platforms built successfully!"
echo ""