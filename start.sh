git pull origin master
export STANDISH_PUBLIC_JSON_PATH=/var/www/json.stand.sh/public_html/taylor/data.json
export GOOGLE_CONSUMER_KEY=1093258107267-sqd8u453v2jctmcipts22nrb6amvh1fb.apps.googleusercontent.com
export GOOGLE_CONSUMER_SECRET=q7yqUFihxKXBRwbQ9fEwlAnK
export GOOGLE_CALLBACK_URL=http://rbar.stand.sh/auth/google/callback
export PORT=3002
npm install
forever start app.js
