
# How to start the demo app

This application is for reserving tables in restaurants. In this model implemented ability to call using a list of numbers  and uploading results into separate file in csv format. Before calling, make sure that the data in the numbers.csv file is correct. If you need any help, please contact our developer community
[Developer Community](http://community.dasha.ai).

1. Clone the repo and install the dependencies:
```sh
git clone https://github.com/dasha-samples/dasha-money-transfer-demo
cd dasha-money-transfer-demo
npm install
```

2. Create or log into your account using the Dasha CLI tool:

```sh
npm i -g "@dasha.ai/cli"
npx dasha account login
```

3. To receive a phone call from Dasha, run:
    
    ```sh
    npm start numbers.csv
    ```
     (The phone number should be in the international format without the  `+`, for example `19997775555`. Also before start calling make sure that fields "name,booking_time,user_name,user_phone,persons_number" is correct.).



