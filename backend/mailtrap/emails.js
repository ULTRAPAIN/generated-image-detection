// import { mailtrapClient , sender,transporter } from "./mailtrap.config.js"
// import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js"


// export const sendVerificationEmail =  async (email, verificationToken)=>{
//     const recipient = [{
//     email
//     }]
//     try {
//         const response = await mailtrapClient.send({
//             from:sender,
//             to:recipient,
//             subject:"Verify your Email",
//             html:VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}",verificationToken),
//             category:"Email Verification" 
//         })
//         console.log("Email sent successfully",response)
//     } catch (error) {
//         console.error(`Error sending verification`,error)
//         throw new Error(`Error sending Verification Email:${error}`)

//     }
// }

// export const sendWelcomeEmail = async (email,name) => {
//     const recipient=[{email}]
//     try {
//        const response= await mailtrapClient.send({
//             from :sender,
//             to:recipient,
//             template_uuid:"1b4b16d0-6b0b-41cf-8a89-017be23862af",
//             template_variables:{
//                     name: name
//             },
//         });
//         console.log("Welcome email sent successfully",response);
//     } catch (error) {
//         console.error("Error sending welcome Email",error);
//         throw new Error(`Error sending welcome email:${error}`);
//     }
// }

// export const sendPasswordResetEmail= async (email,resetURL)=> {
//     const recipient = [{email}];
//     try {
//         const response= await mailtrapClient.send({
//             from:sender,
//             to:recipient,
//             subject:"Reset your password",
//             html:PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}",resetURL),
//             category:"Password Reset",
//         })
//     } catch (error) {
//         console.error( `Error sending password reset Email`,error);
//         throw new Error(`Error sending the password reset email:${error}`);
        
//     }
// }

// export const sendResetSuccessEmail = async (email) => {
//     const recipient=[{email}];
//     try{
//         const response = await mailtrapClient.send({
//             from:sender,
//             to:recipient,
//             subject:"Password Reset Successfully",
//             html:PASSWORD_RESET_SUCCESS_TEMPLATE,
//             category:"Password Reset "
//         })
//     }
//     catch(error){
//         console.error( `Error sending password reset successfully`,error);
//         throw new Error(`Error sending the password reset success email:${error}`);
//     }
    
// }

// emailFunctions.js
import transporter from './mailtrap.config.js'; // Import transporter configuration
import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";

// Sender configuration
// export const sender = {
//   email: "hello@demomailtrap.com",
//   name: "Dashrath",
// };

// Function to send verification email
export const sendVerificationEmail = async (email, verificationToken) => {
//   const recipient = [{ email }];
  try {
    const response = await transporter.sendMail({
      from: '"Dashrath" <hello@demomailtrap.com>',
      to: email,
      subject: "Verify your Email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
      category: "Email Verification",
    });

    console.log("Email sent successfully", response);
  } catch (error) {
    console.error(`Error sending verification`, error);
    throw new Error(`Error sending Verification Email: ${error.message}`);
  }
};

// Function to send welcome email
export const sendWelcomeEmail = async (email, name) => {
//   const recipient = [{ email }];
  try {
    const response = await transporter.sendMail({
      from: '"Dashrath" <hello@demomailtrap.com>',
      to: email,
      subject: "Welcome to our platform",
      html: `<p>Welcome ${name},</p><p>Thank you for signing up!</p>`,
      category: "Welcome Email",
    });

    console.log("Welcome email sent successfully", response);
  } catch (error) {
    console.error("Error sending welcome Email", error);
    throw new Error(`Error sending Welcome Email: ${error.message}`);
  }
};

// Function to send password reset email
export const sendPasswordResetEmail = async (email, resetURL) => {
//   const recipient = [{ email }];
  try {
    const response = await transporter.sendMail({
      from:'"Dashrath" <hello@demomailtrap.com>',
      to: email,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "Password Reset",
    });

    console.log("Password reset email sent successfully", response);
  } catch (error) {
    console.error(`Error sending password reset email`, error);
    throw new Error(`Error sending Password Reset Email: ${error.message}`);
  }
};

// Function to send password reset success email
export const sendResetSuccessEmail = async (email) => {
//   const recipient = [{ email }];
  try {
    const response = await transporter.sendMail({
      from: '"Dashrath" <hello@demomailtrap.com>',
      to: email,
      subject: "Password Reset Successfully",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    });

    console.log("Password reset success email sent successfully", response);
  } catch (error) {
    console.error(`Error sending password reset success email`, error);
    throw new Error(`Error sending Password Reset Success Email: ${error.message}`);
  }
};
