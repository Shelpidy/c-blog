import axios from "axios";
import Xray from "x-ray";
import { jwtDecode, jwtEncode } from "../utils/Utils";

type HTMLScrapperParams = {
    url?: string;
    html?: string;
};

export class HTMLScrapper {
    public summary: string = "No Summary";
    public imageUrl: string = "No Image";
    public url: string = "http://google.com";

    public async setContentFromXray(name: string, _type: string,htmlContent:string) {
        try {
            let xray = Xray();
            console.log("HTML Content", htmlContent);
            switch (_type) {
                case "ATTRIBUTE":
                    xray(
                        htmlContent,
                        `img@${name}`
                    )((err, src) => {
                        if (err) {
                            console.log("XRAY ERROR", err);
                            return
                        }
                        this.imageUrl = src;
                    });
                    break;
                case "INNERCONTENT":
                    xray(
                        htmlContent,
                        `${name}@html`
                    )((err, result) => {
                        if (err) {
                            console.log("XRAY ERROR", err);
                        }
                        this.summary = result;
                    });
                    break;
                case "ELEMENT":
                    break;
                default:
            }
        } catch (err) {
            console.log("Fail to get content from Xray", err);
            return null;
        }
    }

    /**
     * getSummary
     */
    public async getSummary({html:htmlContent}:{html:string}) {
        try {
            await this.setContentFromXray("p", "INNERCONTENT",htmlContent);
            console.log(this.summary);
            return this.summary;
        } catch (err) {
            console.log("Error in getSummary", err);
        }
    }


    /**
     * getImage
     */
    public async getImageSrc({html:htmlContent}:{html:string}) {
        await this.setContentFromXray("src", "ATTRIBUTE",htmlContent);
        console.log(this.imageUrl);
        return this.imageUrl;
    }

    /**
     * readHTMLFromUrl
     */
    public async readHTMLFromUrl() {
        try {
            const response = await axios.get(this.url || "");
            return response.data;
        } catch (error) {
            console.error("Error reading HTML from URL:", error);
            return null;
        }
    }
}
let html = `<div> <p>Hello,This is a paragraph Two <p/> <img src ='https://picsum.photos/200/300'/><div/>
`;
// let scrapper = new HTMLScrapper({ html: html });
// jwtEncode({userId:"00126542-83e1-4480-928b-d1349580f4fb"}).then(data=>{
//     console.log("Encoded JWT Data",data)
// })

// jwtDecode('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMDhlZDUyNi1iOGI5LTRmMDYtYTU0NS0wN2U0YzlhMWZhNTgiLCJpYXQiOjE2OTA0NzIzMjJ9.ZfhVY8WX2yBs2RdMGBmN94GbZMsVisYsDUA7wEk3JvE')
// .then(data =>{
//     console.log("Decoded JWT Data",data)
// })
// scrapper.getSummary();
// scrapper.getImageSrc();
