const SAMPLE_QUOTE = [{
    "currency": "USD",
    "systemPrice": 14400,
    "principalAmount": 14399,
    "riskBand": "C",
    "baseApr": 11.9,
    "offers": [
        {
            "termYears": 5,
            "apr": 11.9,
            "principalUsed": 14399,
            "monthlyPayment": 319.57
        },
        {
            "termYears": 10,
            "apr": 11.9,
            "principalUsed": 14399,
            "monthlyPayment": 205.75
        },
        {
            "termYears": 15,
            "apr": 11.9,
            "principalUsed": 14399,
            "monthlyPayment": 171.89
        }
    ],
    "fullName": "Test",
    "email": "brom.online7@gmail.com",
    "id": 123,
    "createdAt": "11/11/1990"
}]

export const getQuoteById = (id: number) => {
    return new Promise((resolve) => {
        resolve(SAMPLE_QUOTE.find(q => q.id === id));
    });
}
