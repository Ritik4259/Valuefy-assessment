const path = require('path');
const express = require('express');
const pagesRouter = require('./routes/pages');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.locals.formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(value || 0));

app.locals.formatPercent = (value) => {
  if (value === null || value === undefined) {
    return '-';
  }

  return `${Number(value).toFixed(1)}%`;
  };

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok'
  });
});

app.use('/', pagesRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', {
    pageTitle: 'Error',
    message: 'Something went wrong while processing the request.'
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
