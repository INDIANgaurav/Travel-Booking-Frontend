const fs = require('fs');
const path = 'c:\\Users\\gasha\\Desktop\\TravelBookingApp\\Client\\src\\components\\admin\\UserProfileForm.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/bg-gray-50 border-none/g, 'bg-white border border-gray-300 shadow-sm');
content = content.replace(/bg-gray-100\/50 border-none/g, 'bg-gray-100 border border-gray-200 shadow-sm');

fs.writeFileSync(path, content);
console.log('Replaced styles successfully');
