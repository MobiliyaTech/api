const { OAuth2Client } = require("google-auth-library");
const UserModel = require("../model/userModel");
const pool = require("../../config/db");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class UserController {
  static async userRegister(req, res) {
    try {
      const { mobile, email, password, first_name, last_name } = req.body;
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists." });
      }
      const { user, profile } = await UserModel.registerUserWithProfile({
        mobile,
        email,
        password,
        first_name,
        last_name,
      });
      return res.status(201).json({
        message: "User registered successfully",
        data: [user, profile],
      });
    } catch (error) {
      console.error("Error in user registration:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async user_Login(req, res) {
    const { email, password } = req.body;
    try {
      const user = await UserModel.findByEmail(email);
  
      if (!user) {
        return res.status(400).send({
          status: false,
          message: "The email address you entered is not registered. Please check and try again.",
          data: [],
        });
      } 
  
      // Check if the user role is "user" only
      if (user.role !== "user") {
        return res.status(403).send({
          status: false,
          message: "Access denied. Only user role is allowed to log in.",
          data: [],
        });
      }
  
      // Check account status
      if (user.status !== "active") {
        return res.status(400).send({
          status: false,
          message: "Your account is not activated.",
          data: [],
        });
      }
  
      // Validate password (using plain comparison, but bcrypt should be used in production)
      if (password !== user.password) {
        return res.status(400).send({
          status: false,
          message: "The password you entered is incorrect. Please try again.",
          data: [],
        });
      }
  
      const LOGIN_SESSION_DURATION = process.env.LOGIN_SESSION_DURATION;
      const userAuthData = {
        id: user.id,
        hashid: user.hashid,
        username: user.first_name,
        fullname: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        db: user.schemas,
      };
  
      // Generate JWT token
      const token = jwt.sign(userAuthData, process.env.JWT_SECRET, {
        expiresIn: LOGIN_SESSION_DURATION,
      });
  
      const user_auth = { ...userAuthData, token };
      return res.status(200).send({
        status: true,
        message: "Login successfully.",
        data: user_auth,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: "An error occurred during login. Please try again later.",
        data: [],
      });
    }
  }
  

  static async getWeb_Login(req, res) {
    const { email, password } = req.body;
    try {
      // const user = await UserModel.findByEmail(email);
      const result = await pool.query(
        `SELECT u.*, c.first_name, c.last_name 
   FROM public.users u
   LEFT JOIN public.counselorprofile c ON u.hashid = c.hashid
   WHERE u.email = $1`,
        [email]
      );
      const user = result.rows[0];
      if (!user) {
        return res.status(400).send({
          status: false,
          message: "Invalid login details",
          data: [],
        });
      } else {
        // const validPassword = await bcrypt.compare(password, user.password);
        // if (!validPassword) { return res.status(400).send({ error: 'Invalid email or password.' });  }
        if (user.status != "active") {
          return res.status(400).send({
            status: false,
            message: "Your Account Not Activate.",
            data: [],
          });
        } else if (password !== user.password) {
          return res.status(400).send({
            status: false,
            message: "Wrong Password.",
            data: [],
          });
        } else {
          const LOGIN_SESSION_DURATION = process.env.LOGIN_SESSION_DURATION;

          const userAuthData = {
            id: user.id,
            hashid: user.hashid,
            username: user.first_name + " " + user.last_name,
            fullname: user.first_name + " " + user.last_name,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            db: user.schemas,
          };
          const token = jwt.sign(userAuthData, process.env.JWT_SECRET, {
            expiresIn: LOGIN_SESSION_DURATION,
          });
          const user_auth = { ...userAuthData, token };
          return res.status(200).send({
            status: true,
            message: "Login Successfully",
            data: user_auth,
          });
        }
      }
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
        data: [],
      });
    }
  }

  static async createContactForm(req, res) {
    const { name, email, message } = req.body;
    try {
      const newMessage = await UserModel.createContactForm({
        name,
        email,
        message,
      });
      res.status(201).json({
        status: true,
        message: "Message created successfully",
        data: newMessage,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: error.message,
        data: [],
      });
    }
  }

  static async getAllContactForms(req, res) {
    try {
      const messages = await UserModel.getAllContactForms();
      res.status(200).json({
        status: true,
        message: "Messages retrieved successfully",
        data: messages,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: error.message,
        data: [],
      });
    }
  }

  static async resetPassword(req, res) {
    const { email } = req.body;
    try {
      // Check if user exists
      const result = await pool.query(
        `SELECT * FROM public.users WHERE email = $1`,
        [email]
      );
      const user = result.rows[0];

      if (!user) {
        return res.status(400).send({
          status: false,
          message: "Email address not found. Please check and try again.",
          data: [],
        });
      }

      // Check user role
      const allowedRoles = ["counselor", "admin"];
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).send({
          status: false,
          message: "You do not have permission to reset passwords.",
          data: [],
        });
      }

      const htmlContent = `
      <html>
      <head>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f4f4f9;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background-color: #5156be;
            color: #ffffff;
            text-align: center;
            padding: 30px 20px;
            font-size: 24px;
            font-weight: bold;
            border-bottom: 3px solid #0062cc;
          }
          .content {
            padding: 40px 20px;
            color: #333333;
            font-size: 16px;
            line-height: 1.6;
            text-align: left;
          }
          .content h2 {
            color: #5156be;
            font-size: 20px;
            margin-bottom: 10px;
          }
          .footer {
            text-align: center;
            font-size: 14px;
            color: #777777;
            padding: 20px;
            background-color: #f4f4f4;
            border-top: 1px solid #e0e0e0;
          }
          .footer a {
            color: #5156be;
            text-decoration: none;
          }
          .btn {
            background-color: #5156be;
            color: #ffffff !important;
            padding: 12px 24px;
            border-radius: 30px;
            text-decoration: none;
            display: inline-block;
            margin-top: 20px;
            font-weight: bold;
            text-align: center;
            border: 1px solid #5156be;
          }
         
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            RectifyYou
            <p style="font-size: 14px; margin-top: 10px;">Your Mental Health Support Partner</p>
          </div>
    
          <!-- Content -->
          <div class="content">
            <h2>Your RectifyYou Password:</h2>
            <p>Dear ${user.name || "User"},</p>
            <p>You have requested your password, please find your password below:</p>
            <p style="font-size: 18px; font-weight: bold; color: #333333;">${user.password}</p>
            <p>If you did not request this change, please ignore this email. Your password will remain unchanged.</p>
            <p style="margin-top: 20px;">If you need further assistance, feel free to reach out to us.</p>
            <a href="http://web.rectifyyou.com.s3-website.ap-south-1.amazonaws.com" class="btn">Go to Login</a>
          </div>
    
          <!-- Footer -->
          <div class="footer">
            <p>Thank you for being part of RectifyYou.</p>
            <p>&copy; ${new Date().getFullYear()} RectifyYou. All Rights Reserved.</p>
            <p>If you need assistance, feel free to contact us at <a href="mailto:support@rectifyyou.com">support@rectifyyou.com</a></p>
          </div>
        </div>
      </body>
    </html>
    `;

      // Send email
      const transporter = nodemailer.createTransport({
        service: "gmail", // Use your email service
        auth: {
          user: process.env.EMAIL_USER, // Your email
          pass: process.env.EMAIL_PASS, // Your email password
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Please find your rectifyyou password",
        html: htmlContent, // Use HTML content for the email
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).send({
            status: false,
            message: "Error sending email.",
            data: [],
          });
        }
        return res.status(200).send({
          status: true,
          message: "Password has been sent to your email.",
          data: [],
        });
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
        data: [],
      });
    }
  }

  // UserController.js

  static async checkEmailExistence(req, res) {
    const { email } = req.body;
    try {
      // Check if user exists
      const result = await pool.query(
        `SELECT * FROM public.users WHERE email = $1`,
        [email]
      );
      const user = result.rows[0];

      if (user) {
        return res.status(200).send({
          status: true,
          message: "Email exists.",
          data: [], // Optionally return user data
        });
      } else {
        return res.status(404).send({
          status: false,
          message: "Email address not found.",
          data: [],
        });
      }
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
        data: [],
      });
    }
  }

  //reset password for frontend

  static async resetPasswordForFrontend(req, res) {
    const { email } = req.body;
    try {
      // Check if user exists
      const result = await pool.query(
        `SELECT * FROM public.users WHERE email = $1`,
        [email]
      );
      const user = result.rows[0];

      if (!user) {
        return res.status(400).send({
          status: false,
          message: "Email address not found. Please check and try again.",
          data: [],
        });
      }

      // Check user role
      const allowedRoles = ["user"];
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).send({
          status: false,
          message: "You do not have permission to reset passwords.",
          data: [],
        });
      }

      // Generate HTML content based on password existence
      const htmlContent = user.password
      ? `
    <html>
      <head>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f4f4f9;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background-color: #5156be;
            color: #ffffff;
            text-align: center;
            padding: 30px 20px;
            font-size: 24px;
            font-weight: bold;
            border-bottom: 3px solid #0062cc;
          }
          .content {
            padding: 40px 20px;
            color: #333333;
            font-size: 16px;
            line-height: 1.6;
            text-align: left;
          }
          .content h2 {
            color: #5156be;
            font-size: 20px;
            margin-bottom: 10px;
          }
          .footer {
            text-align: center;
            font-size: 14px;
            color: #777777;
            padding: 20px;
            background-color: #f4f4f4;
            border-top: 1px solid #e0e0e0;
          }
          .footer a {
            color: #5156be;
            text-decoration: none;
          }
          .btn {
            background-color: #5156be;
            color: #ffffff !important;
            padding: 12px 24px;
            border-radius: 30px;
            text-decoration: none;
            display: inline-block;
            margin-top: 20px;
            font-weight: bold;
            text-align: center;
            border: 1px solid #5156be;
          }
         
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            RectifyYou
            <p style="font-size: 14px; margin-top: 10px;">Your Mental Health Support Partner</p>
          </div>
    
          <!-- Content -->
          <div class="content">
            <h2>Your RectifyYou Password:</h2>
            <p>Dear ${user.name || "User"},</p>
            <p>You have requested your password, please find your password below:</p>
            <p style="font-size: 18px; font-weight: bold; color: #333333;">${user.password}</p>
            <p>If you did not request this change, please ignore this email. Your password will remain unchanged.</p>
            <p style="margin-top: 20px;">If you need further assistance, feel free to reach out to us.</p>
            <a href="http://rectifyyou.com" class="btn">Go to Login</a>
          </div>
    
          <!-- Footer -->
          <div class="footer">
            <p>Thank you for being part of RectifyYou.</p>
            <p>&copy; ${new Date().getFullYear()} RectifyYou. All Rights Reserved.</p>
            <p>If you need assistance, feel free to contact us at <a href="mailto:support@rectifyyou.com">support@rectifyyou.com</a></p>
          </div>
        </div>
      </body>
    </html>`
      : `
    <html>
      <head>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f4f4f9;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background-color: #5156be;
            color: #ffffff;
            text-align: center;
            padding: 30px 20px;
            font-size: 24px;
            font-weight: bold;
            border-bottom: 3px solid #0062cc;
          }
          .content {
            padding: 40px 20px;
            color: #333333;
            font-size: 16px;
            line-height: 1.6;
            text-align: left;
          }
          .content h2 {
            color: #5156be;
            font-size: 20px;
            margin-bottom: 10px;
          }
          .footer {
            text-align: center;
            font-size: 14px;
            color: #777777;
            padding: 20px;
            background-color: #f4f4f4;
            border-top: 1px solid #e0e0e0;
          }
          .footer a {
            color: #5156be;
            text-decoration: none;
          }
         .btn {
            background-color: #5156be;
            color: #ffffff !important;
            padding: 12px 24px;
            border-radius: 30px;
            text-decoration: none;
            display: inline-block;
            margin-top: 20px;
            font-weight: bold;
            text-align: center;
            border: 1px solid #5156be;
          }
          
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            RectifyYou
            <p style="font-size: 14px; margin-top: 10px;">Your Mental Health Support Partner</p>
          </div>
    
          <!-- Content -->
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Dear ${user.name || "User"},</p>
            <p>It appears that you signed up using Google Sign-In. As a result, you do not have a traditional password to reset.</p>
            <p>To access your account, please use the "Sign in with Google" button on our login page. This will allow you to securely log in and manage your account settings.</p>
            <p>If you did not request this reset or need further assistance, please don't hesitate to contact us.</p>
            <a href="http://rectifyyou.com" class="btn">Go to Login</a>
          </div>
    
          <!-- Footer -->
          <div class="footer">
            <p>Thank you for being part of RectifyYou.</p>
            <p>&copy; ${new Date().getFullYear()} RectifyYou. All Rights Reserved.</p>
            <p>If you need assistance, feel free to contact us at <a href="mailto:support@rectifyyou.com">support@rectifyyou.com</a></p>
          </div>
        </div>
      </body>
    </html>

    

      `;

      // Send email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Please find your rectifyyou password",
        html: htmlContent,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).send({
            status: false,
            message: "Error sending email.",
            data: [],
          });
        }
        return res.status(200).send({
          status: true,
          message:
            "Your password is sent to your registered email address.",
          data: [],
        });
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
        data: [],
      });
    }
  }

  static async user_GoogleLogin(req, res) {
    const { token } = req.body;
  
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
  
      // Extract necessary data from the payload
      const { email, given_name: firstName, family_name: lastName } = payload;
  
      // Check if the user already exists
      let user = await UserModel.findByEmail(email);
      let isNewUser = false;
  
      if (!user) {
        // User does not exist, create a new user
        isNewUser = true;
        user = await UserModel.create({
          first_name: firstName || "",
          last_name: lastName || "",
          email,
          status: "active",
          role: "user", // Set role to "user" by default
        });
  
        // Fetch newly created user's full details
        user = await UserModel.findByEmail(email);
      }
  
      // Restrict login to users only
      if (user.role !== "user") {
        return res.status(403).send({
          status: false,
          message: "Access denied. Only user role is allowed to log in.",
          data: [],
        });
      }
  
      // Create session data
      const userAuthData = {
        id: user.id,
        hashid: user.hashid,
        username: user.first_name,
        fullname: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        db: user.schemas,
      };
  
      // Generate JWT token
      const authToken = jwt.sign(userAuthData, process.env.JWT_SECRET, {
        expiresIn: process.env.LOGIN_SESSION_DURATION,
      });
  
      // Send response with appropriate message
      return res.status(200).send({
        status: true,
        message: isNewUser
          ? "Registration successful. Welcome!"
          : "Logged in successfully.",
        data: { ...userAuthData, token: authToken },
      });
    } catch (error) {
      console.error("Error in Google login:", error);
      return res.status(500).send({
        status: false,
        message: "An error occurred during Google login. Please try again later.",
        data: [],
      });
    }
  }
    
  
}

module.exports = UserController;
