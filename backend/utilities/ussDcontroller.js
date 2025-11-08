const conn = require("../db/connection");
const getUssdData = require("./getUssdData");
class UssdController {
  inputValidate(txt) {
    let formartedText = txt.trim();
    let step = txt==""? 0 : formartedText.split("*").length;
    let fText = txt==""? "": formartedText.split("*")[step - 1];
    return { step, fText, formartedText };
  }
  async getFormartResponse(input) {
    const nid = input.formartedText.split("*")[0];
    if (nid.length != 16) return "END Winjijemo indangamunu itariyo!";

    const [user] = await conn.query(
      "SELECT COUNT(*) total from members where nid=?",
      [nid]
    );
    const userExist = user[0].total == 1;
    if (!userExist) {
      return "CON NIMERO YINDANGAMUNU MWINJIJE NTAKONTI BIHURA";
    }
    if (userExist) {
      return "CON INJIZA UMUBARE W'IBANGA";
    }
  }
  async getData(input) {
    return getUssdData(input);
  }
  async responseGenerator(input) {
    let response = "";
    switch (input.step) {
      case 0:
        response = `CON IKAZE KURUBUGA RWIKIBINA
                    ANDIKA NIMERO YAWE YINDANGAMUNTU`;
        break;
      case 1:
        response = `CON HITAMO
        1. ayo mfite kuri konti;
        2. ibihano
        3. inguzanyo 
        `;
        break;
      case 2:
        response = await this.getFormartResponse(input);
        break;
      case 3:
        response = await this.getData(input);
    }
    return response;
  }

  async getResponse(txt) {
    return this.responseGenerator(this.inputValidate(txt));
  }
}

module.exports = UssdController;
