const express = require('express');
const routerAapp = require('./routes');
const app = express();
const env = require('./environments');

app.use(express.json());

// app.use((req, res) => {
//   res.status(404).json({ message: 'I didn’t find the endpoint'});
// })

app.listen(env.port, () => {
  const consoleMessage = env.execution === 'development' ?  `Server initialized ${env.server}:${env.port} in mode ${env.execution}` : `Server initialized in mode ${env.execution}`;
  console.info(consoleMessage);
});

if (env.execution === 'development' || env.execution === 'production') {

  // *** COMMON ***

  app.get('/', (req, res) => {
    res.status(200).send('Welcome to Neec backend server');
  });

  app.get('/api', (req, res) => {
    res.status(200).json(
      {
        app: 'Neec Backend API',
        lastVersion: '1.0.0',
      }
    );
  });

  // *** SERVICIOS ***

  routerAapp(app);

} else {
  app.get('*', (req, res) => {
    return res.status(500).json({ error: 'I don’t have a defined execution environment' });
  });
}

