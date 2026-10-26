export function QuoteDetails({ quote }) {
    const { fullName, email, address, monthlyConsumptionKwh, systemSizeKw, downPayment, systemPrice, principalAmount, offers, riskBand, baseApr } = quote;

    return (
        <>
            <section>
                <h2>Your system</h2>
                <div>
                    <div>
                        <div>System price</div>
                        <div>{systemPrice}</div>
                    </div>
                    <div>
                        <div>Amount financed</div>
                        <div>{principalAmount}</div>
                    </div>
                    <div>
                        <div>Risk band</div>
                        <div>
                            <p>{riskBand}</p>
                        </div>
                    </div>
                </div>
                <p>
                    Base APR - {baseApr}.
                </p>
            </section>

            <section>
                <h2>Financing offers</h2>
                <ul>
                    {offers.map((o) => (
                        <li key={o.termYears}>
                            <div>{o.termYears} years</div>
                            <p>{o.monthlyPayment}</p>
                            <p>per month</p>
                            <dl>
                                <div>APR</div>
                                <div>{o.apr}</div>
                                <div>Principal</div>
                                <div>{o.principalUsed}</div>
                            </dl>
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <h2 id="inputs-heading">Your Details</h2>
                <div>
                    <div>Name</div>
                    <div>{fullName}</div>
                    <div>Email</div>
                    <div>{email}</div>
                    <div>Address</div>
                    <div>{address}</div>
                    <div>Monthly consumption</div>
                    <div>{monthlyConsumptionKwh} kWh</div>
                    <div>System size</div>
                    <div>{systemSizeKw} kW</div>
                    <div>Down payment</div>
                    <div>{downPayment}</div>
                </div>
            </section>
        </>
    )
}