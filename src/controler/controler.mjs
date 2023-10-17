import axios from "axios";
import express, { response } from 'express'
import puppeteer from "puppeteer";
import users from "../../user.mjs";
let encodedImage;
let accessToken;
let count = 190;
const getHomePage = async (req, res) => {
    let dataCapcha;
    await axios.post('https://banca50.com/api/0.0/Home/GetCaptchaForLogin')
        .then((response) => { dataCapcha = response.data; encodedImage = response.data.value })
        .catch((e) => { console.log(e) })
    res.render('fillCapcha', { valueImage: dataCapcha.image })
}

const postData = async (req, res) => {

    //login bang axios
    await axios.post('https://banca50.com/api/0.0/Login/login', {
        account: users[count].userName,
        checkCode: req.body.capchaValue,
        checkCodeEncrypt: encodedImage,
        fingerprint: 'b2974e51c117545a7025bbe60d64d78d',
        password: users[count].passWord
    })
        .then((response) => {
            if (response.data.IsSuccess) {
                accessToken = response.data.LoginToken.AccessToken;
                console.log(`login sussecfully`, users[count].userName, 'hiện tại tool đang chạy đến cout = ', count)
            }
            else {
                console.log(`>>>>>>>>>>>>>>>>acc nay bi sai tai khoan : <<<<<<<<<<<<<<<<<<<<<<<< `, users[count].userName)
            }
        })
        .catch((e) => { console.log(e) })

    await (async () => {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 })

        const headers = {
            'Authorization': `Bearer ${accessToken}`,
        };

        await page.setExtraHTTPHeaders(headers);

        await page.goto('https://banca50.com');

        //Thực hiện các tác vụ tương tác với trang web
        // await page.waitForSelector('.btn.btn-link')
        // await page.click('.btn.btn-link')
        await page.evaluate(() => {
            let closeButton = document.querySelector('.btn.btn-link');
            if (closeButton) {
                closeButton.click();
            } else {
                console.error("Không tìm thấy phần tử để click");
            }
        });


        const closeTab = async () => {
            await page.evaluate(() => {
                let closeButton = document.querySelector('button[translate="RedEnvelope_Close"]');
                if (closeButton) {
                    closeButton.click();
                } else {
                    console.error("Không tìm thấy phần tử để click");
                }
            });
        }

        await page.evaluate(() => {
            let closeButton = document.querySelector('.ng-scope span[ng-click="$ctrl.ok()"][translate="Common_Closed"]');
            if (closeButton) {
                closeButton.click();
            } else {
                console.error("Không tìm thấy phần tử để click");
            }
        });


        await page.evaluate(() => {
            let closeButton = document.querySelector('div.m6St-e1wM0x21-4b5uLpn.ng-scope[translate="RedEnvelope_GrabEenvelope"]');
            if (closeButton) {
                closeButton.click();
            } else {
                console.error("Không tìm thấy phần tử để click");
            }
        });



        const spanText = await page.evaluate(() => {
            const spanElement = document.querySelector('span.gSzr4CypKJcHsURkQtHL1.ng-scope[translate="RedEnvelope_ReceiveAmountTip"]');

            if (spanElement) {
                return spanElement.textContent.trim().split(" ")[2]
            } else {
                return 0
            }
        });

        const getBalanceAccount = async () => {
            await page.waitForSelector('span.balance.ng-binding._3lymj_9N-oJ2lPh20o6tzf');

            // Sử dụng Puppeteer để tìm phần tử cụ thể bằng thuộc tính title
            const element = await page.$('span.balance.ng-binding._3lymj_9N-oJ2lPh20o6tzf');

            if (element) {
                // Lấy số dư của tài khoản sau khi nhận là :
                const textContent = await page.evaluate(element => element.textContent, element);
                console.log('số dư của tài khoản sau khi nhận là ::', textContent);
                console.log('')
            } else {
                console.error('Không tìm thấy phần tử.');
            }
        }

        let quantityOfEnvelopes = Number(spanText)
        if (quantityOfEnvelopes === 0) {
            console.log(`khong co li xi nao de nhan o acc nay`)
            await getBalanceAccount()
            browser.close()
        }

        const getCoin = async () => {
            await page.waitForSelector('img[ng-src="https://haon2020.earvf.net/system-requirement/Web.PortalNew/UA532-01/56bc9ae4f6/images/da64f917d8eced48bf1c10e83be937f8.png"]');
            await page.evaluate(() => {
                const element = document.querySelector('img[ng-src="https://haon2020.earvf.net/system-requirement/Web.PortalNew/UA532-01/56bc9ae4f6/images/da64f917d8eced48bf1c10e83be937f8.png"]');
                if (element) {
                    element.click();
                } else {
                    console.error('Không tìm thấy phần tử để click');
                }
            });

            // await page.waitForTimeout(500);
            // await page.waitForSelector('img[src="https://haon2020.earvf.net/system-requirement/Web.PortalNew/UA532-01/72dfe62142/images/7b344d4e6413b7088ce8a269048ff282.png"]')
            // await page.evaluate(() => {
            //     const button = document.querySelector('img[src="https://haon2020.earvf.net/system-requirement/Web.PortalNew/UA532-01/72dfe62142/images/7b344d4e6413b7088ce8a269048ff282.png"]');
            //     if (button) {
            //         button.click();
            //     } else {
            //         console.error("Không tìm thấy phần tử để click");
            //     }
            // });
            await page.waitForTimeout(500);
            await page.waitForSelector('button[ng-click="$ctrl.remove(redEnvelope)"]')
            await page.evaluate(() => {
                const button = document.querySelector('button[ng-click="$ctrl.remove(redEnvelope)"]');
                if (button) {
                    button.click();
                } else {
                    console.error("Không tìm thấy phần tử để click");
                }
            });
        }

        if (quantityOfEnvelopes === 1) {
            console.log(`acc nay co 1 li xi`);
            await getCoin()
            await closeTab()
            await getBalanceAccount()
            browser.close()
        }


        const getCoinMoreThanOne = async () => {
            if (!isNaN(quantityOfEnvelopes) && quantityOfEnvelopes >= 1) {
                await getCoin();
                quantityOfEnvelopes--;
                getCoinMoreThanOne()
            } else {
                await closeTab()
                await getBalanceAccount()
                browser.close()
            }
        }

        if (!isNaN(quantityOfEnvelopes) && quantityOfEnvelopes > 1) {
            console.log(`acc nay co ${quantityOfEnvelopes} li xi de nhan`)
            getCoinMoreThanOne()
        }


    })();


    count++
    res.redirect('/')

}


const Controler = {
    getHomePage: getHomePage,
    postData: postData,
}

export default Controler