const fs = require('fs');
async function test() {
  const formData = new FormData();
  formData.append('source', 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'); // 1x1 base64 transparent gif
  formData.append('key', '6d207e02198a847aa98d0a2a901485a5');
  
  try {
    const res = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}
test();
