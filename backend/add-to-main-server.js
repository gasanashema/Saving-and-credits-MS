// Add this to your main server file (app.js or server.js)

const paymentRoutes = require('./routes/payment');

// Add this line with your other route definitions
app.use('/api/ikv1/payment', paymentRoutes);