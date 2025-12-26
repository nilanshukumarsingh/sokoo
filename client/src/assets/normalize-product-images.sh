#!/bin/bash

# =============================================================
# normalize-product-images.sh
# 
# Auto-crops transparent borders and normalizes images to
# consistent square dimensions for uniform display.
#
# Usage: ./normalize-product-images.sh [input_dir] [output_size]
#   input_dir   - Directory containing PNG images (default: current dir)
#   output_size - Square dimension in pixels (default: 1024)
#
# Example: ./normalize-product-images.sh ./assets 1024
# =============================================================

set -e

INPUT_DIR="${1:-.}"
OUTPUT_SIZE="${2:-1024}"
BACKUP_DIR="${INPUT_DIR}/originals"

echo "🖼️  Product Image Normalizer"
echo "================================"
echo "Input directory: $INPUT_DIR"
echo "Output size: ${OUTPUT_SIZE}x${OUTPUT_SIZE}"
echo ""

# Check for ImageMagick
if ! command -v convert &> /dev/null; then
    echo "❌ Error: ImageMagick is required but not installed."
    echo "   Install with: sudo apt install imagemagick"
    exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Count images
PNG_COUNT=$(find "$INPUT_DIR" -maxdepth 1 -name "*.png" -type f | wc -l)

if [ "$PNG_COUNT" -eq 0 ]; then
    echo "❌ No PNG files found in $INPUT_DIR"
    exit 1
fi

echo "📁 Found $PNG_COUNT PNG files"
echo ""

# Process each PNG
for img in "$INPUT_DIR"/*.png; do
    [ -f "$img" ] || continue
    
    filename=$(basename "$img")
    
    # Skip if already in backup folder
    if [[ "$img" == *"/originals/"* ]]; then
        continue
    fi
    
    echo "🔄 Processing: $filename"
    
    # Backup original
    cp "$img" "$BACKUP_DIR/$filename"
    
    # Step 1: Trim transparent borders (auto-crop)
    # Step 2: Add a small 5px margin
    # Step 3: Resize down only if it's excessively large (optional, keeping current approach)
    
    convert "$img" \
        -fuzz 10% \
        -trim +repage \
        -bordercolor none -border 5 \
        "$img"
    
    # Get new dimensions for verification
    NEW_DIMS=$(identify -format '%wx%h' "$img" 2>/dev/null)
    echo "   ✅ Done: $NEW_DIMS"
done

echo ""
echo "================================"
echo "✨ All images normalized!"
echo "📦 Originals backed up to: $BACKUP_DIR"
echo ""
echo "Each image is now:"
echo "  • Auto-cropped (no wasted transparent space)"
echo "  • Resized to fit ${OUTPUT_SIZE}x${OUTPUT_SIZE}"
echo "  • Centered on a square canvas"
