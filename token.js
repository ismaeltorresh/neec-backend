const axios = require("axios");

const options = {
  method: "GET",
  url: "http://localhost:3006/api/v1/template",
  headers: { "authorization": "Bearer TOKEN" },
};

axios(options)
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.log(error);
  });
