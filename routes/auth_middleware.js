const jwt = require('jsonwebtoken');
// const secret_key = 'hackedPassword123';


exports.verifyToken = (req, res, next) => {
	if (!req.session.jwt) {
		return res.status(400).send({
			status: 400,
			message: "No token provided!",
			data: {}
		});
	}
	else {
		// let token = req.headers["authorization"].split(' ')[1];
        let jwtToken = req.session.jwt;
		const {admin_id} = jwt.verify(jwtToken, process.env.JWT_KEY);
        req.loggedInUser = admin_id; 
        next();  
	}
};

