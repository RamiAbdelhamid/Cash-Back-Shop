#!/bin/bash

# بناء تطبيق React
echo "Building React application..."
cd ../Shop
npm install
npm run build

# العودة إلى مجلد الخادم
cd ../back

echo "Build completed successfully!" 