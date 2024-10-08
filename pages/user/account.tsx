import { ChildPageProps } from "@/utils/props";
import axios from "axios";
import Link from "next/link";
import { Loan } from "@/utils/props";
import { useEffect, useState } from "react";
import LoanCard from "@/components/loan-card";
import localFont from "@next/font/local";
import { formatCurrency } from "@/utils/functions";
import { Payment } from "@prisma/client";

const robotoCondensed = localFont({
  src: [
    {
      path: "../../public/fonts/RobotoCondensed-Regular.ttf",
      weight: "400",
    },
  ],
  variable: "--font-roboto-condensed",
});

const robotoMono = localFont({
  src: [
    {
      path: "../../public/fonts/RobotoMono-Regular.ttf",
      weight: "400",
    },
  ],
  variable: "--font-roboto-mono",
});

const Account: React.FC<ChildPageProps> = ({
  isConnected,
  address,
  user,
  router,
  data,
}) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [hasPending, setHasPending] = useState(false);
  const [hasApproved, setHasApproved] = useState(false);
  const [balance, setBalance] = useState(0);
  const [payments, setPayments] = useState<Payment[]>([]);

  const fetchLoans = async () => {
    if (user.id !== "")
      try {
        const response = await axios.get(`/api/loan/${user.id}`);
        setLoans(response.data);
        response.data.forEach((loan: Loan) => {
          if (loan.pending) setHasPending(true);
          if (!loan.pending && !loan.funding) setHasApproved(true);
        });

        calculateBalance(response.data);
        fetchPayments(response.data.map((loan: Loan) => loan.id));
      } catch (error) {
        console.error("Error fetching loans: ", error);
      }
  };

  const fetchPayments = async (loanIDs: string[]) => {
    try {
      const paymentPromises = loanIDs.map((loanID) =>
        axios.get(`/api/payment/${loanID}`)
      );

      const responses = await Promise.all(paymentPromises);
      const payments = responses.map((response) => response.data);
      const allPayments = payments.flat();

      setPayments(allPayments);
    } catch (error) {
      console.error("Error fetching payments: ", error);
    }
  };

  const calculateBalance = (loans: Loan[]) => {
    const totalBalance = loans
      .filter((loan) => !loan.paid)
      .reduce((acc, loan) => acc + loan.loanAmount, 0);

    setBalance(totalBalance);
  };

  const calculateTotalPayments = (payments: Payment[]) => {
    const positivePayments = payments.filter((payment) => payment.balance > 0);

    const total = positivePayments
      .map((payment) => payment.balance)
      .reduce((acc, amount) => acc + amount, 0);

    return total;
  };

  const updateLoan = (updatedLoan: Loan) => {
    setLoans((prevLoans) =>
      prevLoans.map((loan) => (loan.id === updatedLoan.id ? updatedLoan : loan))
    );
  };

  useEffect(() => {
    fetchLoans();
  }, [user]);

  return (
    <div className="px-20 min-h-screen">
      <div>
        {/* <p className="font-bold text-5xl pt-20">Welcome, {user.name}!</p> */}
        {/* {hasPending ? (
            <p className="text-xl font-light mb-4 mt-8">
              After completing the DocuSign, please be on the lookout for an
              approval email when UrbanGate approves your loan.
            </p>
          ) : (
            ""
          )} */}
        {/* {hasApproved ? (
            <p className="text-xl font-light mb-4 mt-8">
              One of your loans has been approved! Please click "Fund Loan" to
              begin your investment.
            </p>
          ) : (
            ""
          )} */}
        <div className="border border-grey-border py-6 mt-16 rounded-t-3xl">
          <p
            className={`text-4xl mb-4 mt-8 ${robotoCondensed.variable} font-roboto-condensed text-white font-light uppercase text-center`}
          >
            Your Account Summary
          </p>
        </div>

        <div className="text-white grid grid-cols-3">
          <div className="border-l border-r border-b border-grey-border flex flex-col items-center p-8 flex-grow">
            <p
              className="uppercase text-2xl font-light"
              style={{ fontVariant: "all-small-caps" }}
            >
              Account Balance
            </p>
            <p
              className={`text-gold ${robotoCondensed.variable} font-roboto-condensed text-6xl tracking-wide`}
              style={{ fontVariant: "all-small-caps" }}
            >
              {formatCurrency(balance)}
            </p>
          </div>

          <div className="border-l border-r border-b border-grey-border flex flex-col items-center p-8 flex-grow">
            <p
              className="uppercase text-2xl font-light"
              style={{ fontVariant: "all-small-caps" }}
            >
              Net Profits
            </p>
            <p
              className={`text-gold ${robotoCondensed.variable} font-roboto-condensed text-6xl tracking-wide`}
              style={{ fontVariant: "all-small-caps" }}
            >
              {formatCurrency(calculateTotalPayments(payments))}
            </p>
          </div>
          <div className="border-l border-r border-b border-grey-border flex flex-col items-center p-8 flex-grow">
            <p
              className="uppercase text-2xl font-light"
              style={{ fontVariant: "all-small-caps" }}
            >
              Active Loans
            </p>
            <p
              className={`text-gold ${robotoCondensed.variable} font-roboto-condensed text-6xl tracking-wide`}
              style={{ fontVariant: "all-small-caps" }}
            >
              {loans.filter((loan) => loan.paid === false).length}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-16">
          {loans.length !== 0 ? (
            loans
              .filter((loan) => loan.paid === false)
              .map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  user={user}
                  updateLoan={updateLoan}
                />
              ))
          ) : (
            <p
              className={`text-2xl text-white ${robotoMono.variable} font-roboto-mono`}
            >
              You currently have no loans. Start investing{" "}
              <Link className="text-gold" href="/">
                here!
              </Link>
            </p>
          )}
        </div>
        <div className="border border-grey-border mt-16 rounded-t-3xl mb-16">
          <p
            className={`text-4xl mb-4 mt-8 ${robotoCondensed.variable} font-roboto-condensed text-white font-light uppercase text-center pt-10`}
          >
            Your Previous Investments
          </p>
          <div className="flex flex-col gap-4 mt-16">
            {loans.filter((loan) => loan.paid === true).length !== 0 ? (
              loans
                .filter((loan) => loan.paid === true)
                .map((loan) => (
                  <LoanCard
                    key={loan.id}
                    loan={loan}
                    user={user}
                    updateLoan={updateLoan}
                  />
                ))
            ) : (
              <p
                className={`text-2xl text-white ${robotoMono.variable} font-roboto-mono border border-grey-border p-6`}
              >
                You currently have not finished funding any loans.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
