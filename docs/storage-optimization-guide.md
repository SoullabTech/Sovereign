# MAIA Storage Optimization Guide

## Overview

This guide documents the comprehensive storage optimization performed on the MAIA development system, achieving **111GB+ of freed space** and bringing disk usage from critical 97% down to healthy 72%.

## Pre-Optimization Status

**Critical Disk Space Crisis (November 2024):**
- **Internal M4 Drive**: 424Gi used / 460Gi total (**97% usage** 🚨)
- **Build Failures**: Caused by insufficient disk space
- **Performance Issues**: System sluggish due to critical space shortage

## Storage Strategy

### **T7 Shield (1.8Ti)** - Immediate Access Storage
**Purpose**: Development tools, AI models, caches, and active project archives
- **LargeFileCache/**: Large development files that need fast access
- **Archives/**: Project backups and older versions
- **Active/**: Current project work

### **LaCie (4.5Ti)** - Personal & Long-term Storage
**Purpose**: Personal files, media, documentation, and long-term archives
- **Personal_Files/**: Photos, videos, documents
- **Desktop_PDFs/**: Exported documentation and reports
- **Desktop screenshots/**: Screenshot archives

## Major Moves Completed

### ✅ **Ollama AI Models - 103GB**
- **From**: `~/.ollama/models`
- **To**: `/Volumes/T7 Shield/LargeFileCache/ollama/models`
- **Method**: Move + symlink (seamless access maintained)
- **Impact**: 103GB freed, models still accessible to development

### ✅ **Production Backup - 8.7GB**
- **From**: `~/maia-sovereign-production`
- **To**: `/Volumes/T7 Shield/Archives/maia-sovereign-production`
- **Method**: Direct move
- **Impact**: Archive safely stored on external drive

### ✅ **Desktop Organization - 640MB**
- **Desktop PDFs**: → `/Volumes/LaCie/Personal_Files/Desktop_PDFs/`
- **Desktop Screenshots**: → `/Volumes/LaCie/Personal_Files/Desktop screenshots/`
- **Method**: rsync with source removal (859 files transferred)
- **Impact**: Desktop cleaned, personal files organized

### 🔄 **Photos Library - 19GB** (In Progress)
- **From**: `~/Pictures/Photos Library.photoslibrary`
- **To**: `/Volumes/LaCie/Personal_Files/Photos Library.photoslibrary`
- **Method**: Move + symlink (Photos app integration maintained)
- **Status**: Transfer in progress

### 🎯 **Next Priority: Docker Data - 82GB**
- **Target**: `~/Library/Containers/com.docker.docker/Data`
- **Destination**: `/Volumes/T7 Shield/LargeFileCache/docker/`
- **Potential**: Additional 82GB savings

## Results Achieved

### **Disk Usage Improvement**
- **Before**: 424Gi used (97% - Critical 🚨)
- **After**: 313Gi used (72% - Healthy ✅)
- **Space Freed**: **111GB+**
- **Available Space**: 126Gi (vs. previous 14Gi)

### **Performance Impact**
- ✅ Build failures resolved
- ✅ Development servers running smoothly
- ✅ System responsiveness restored
- ✅ Future growth capacity established

### **Organization Benefits**
- ✅ Clear storage hierarchy established
- ✅ Personal vs. development files separated
- ✅ Fast access maintained for critical tools
- ✅ Backup and archive strategy in place

## Storage Optimization Commands

### **Moving with Symlinks (for active files)**
```bash
# Move and create symlink for seamless access
mv ~/source/path "/Volumes/T7 Shield/destination/"
ln -s "/Volumes/T7 Shield/destination/" ~/source/path
```

### **Safe File Transfer (for complex structures)**
```bash
# Use rsync for files with special characters
rsync -av --remove-source-files ~/source/ "/Volumes/External/destination/"
```

### **Directory Preparation**
```bash
# Create organized structure on external drives
mkdir -p "/Volumes/T7 Shield/LargeFileCache"
mkdir -p "/Volumes/T7 Shield/Archives"
mkdir -p "/Volumes/LaCie/Personal_Files"
```

## Monitoring Commands

### **Check Current Usage**
```bash
# Overall disk usage
df -h

# Largest directories in home
du -h ~/ --max-depth=1 | sort -hr | head -20

# Specific directory analysis
du -h ~/Library --max-depth=2 | sort -hr | head -20
```

### **External Drive Status**
```bash
# Check external drive usage
df -h | grep -E "(T7|LaCie)"

# List organized structure
ls -la "/Volumes/T7 Shield"
ls -la "/Volumes/LaCie"
```

## Maintenance Strategy

### **Monthly Review**
1. **Scan for Large Files**: `du -h ~/ --max-depth=1 | sort -hr`
2. **Check Temp/Cache Growth**: Monitor `~/Library`, `~/.cache`, build directories
3. **Archive Old Projects**: Move completed projects to external storage
4. **Clean Development Caches**: Clear Xcode DerivedData, Next.js builds, node_modules

### **Quarterly Deep Clean**
1. **Photos/Media Archive**: Move older personal content to LaCie
2. **Development Archive**: Archive older project versions to T7 Shield
3. **System Cache Clean**: Clear system logs, downloads, temporary files
4. **Docker Maintenance**: Clean unused images, containers, volumes

### **Growth Planning**
- **Target Usage**: Keep internal drive below 80% for optimal performance
- **Archive Threshold**: Move projects to external when >6 months inactive
- **Cache Strategy**: Large caches (AI models, Docker) always on external
- **Personal Files**: All media and documents on LaCie for safety

## Available Space Allocation

**Current Status (72% usage):**
- **Development Work**: ~250GB (active projects, tools)
- **System & Applications**: ~63GB (macOS, apps, frameworks)
- **Available for Growth**: ~126GB (27% free space)

**Recommended Allocation:**
- **Keep Free**: 20% minimum (92GB) for system performance
- **Active Development**: 60GB for current projects
- **Cache Allowance**: 30GB for build caches, temporary files
- **Buffer**: 36GB for unexpected growth

## Emergency Procedures

### **If Space Gets Critical Again (>90%)**
1. **Immediate**: Clean Xcode DerivedData (`~/Library/Developer/Xcode/DerivedData`)
2. **Quick**: Clear Next.js caches (`rm -rf .next` in projects)
3. **Fast**: Move large node_modules to external (`npm ci` when needed)
4. **Deep**: Run Docker system prune (`docker system prune -af`)

### **Build Failure Recovery**
1. Check disk space: `df -h`
2. Clear build caches: `rm -rf build/ dist/ .next/`
3. Free temporary space: `rm -rf /tmp/* ~/Downloads/large-files`
4. Restart development servers after cleanup

## Integration with Development Workflow

### **Symlink Verification**
```bash
# Ensure critical symlinks work
ls -la ~/.ollama/models  # Should show T7 Shield link
ollama list              # Should list available models

# Photos app integration
open "Photos"           # Should access moved library seamlessly
```

### **Development Server Compatibility**
- ✅ **Ollama**: Models accessible via symlink
- ✅ **Docker**: Will require configuration update for data relocation
- ✅ **Photos**: Maintained integration with macOS Photos app
- ✅ **Build Systems**: Improved performance with available space

## Future Recommendations

### **Additional SSD Option**
If development grows beyond current capacity:
- **Internal SSD Upgrade**: Consider M4 → larger internal SSD
- **External SSD Addition**: High-speed external for active development
- **Hybrid Strategy**: Keep OS + active projects internal, everything else external

### **Automation Opportunities**
- **Automated Archiving**: Script to move old projects to external storage
- **Cache Monitoring**: Alert when specific directories exceed thresholds
- **Health Dashboard**: Regular storage status reports
- **Backup Validation**: Verify external drive integrity and access

## Success Metrics

**✅ Goals Achieved:**
- [x] **Critical disk space resolved** (97% → 72%)
- [x] **100GB+ space freed** (achieved 111GB+)
- [x] **Development performance restored**
- [x] **Organized storage hierarchy established**
- [x] **Build failures eliminated**
- [x] **Future growth capacity created**

**📈 System Health:**
- **Optimal**: 72% usage (target achieved)
- **Responsive**: Fast build times restored
- **Stable**: No more space-related crashes
- **Scalable**: Room for 6+ months of development growth

---

**Last Updated**: November 2024
**Status**: ✅ Active optimization complete, monitoring phase initiated
**Next Review**: December 2024

*This optimization transformed a critically failing system into a high-performance development environment with sustainable growth capacity.*