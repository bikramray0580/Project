import java.util.*;

class BankAccount {
    int accNo;
    String name;
    double balance;

    BankAccount(int accNo, String name, double balance) {
        this.accNo = accNo;
        this.name = name;
        this.balance = balance;
    }

    void deposit(double amount) {
        if (amount <= 0) {
            System.out.println("Invalid Amount!");
            return;
        }
        balance += amount;
        System.out.println("Deposit Successful!");
    }

    void withdraw(double amount) {
        if (amount <= 0) {
            System.out.println("Invalid Amount!");
        } else if (amount > balance) {
            System.out.println("Insufficient Balance!");
        } else {
            balance -= amount;
            System.out.println("Withdrawal Successful!");
        }
    }

    void display() {
        System.out.println("Acc No: " + accNo +
                " | Name: " + name +
                " | Balance: " + balance);
    }
}

public class BankSystem {

    static Scanner sc = new Scanner(System.in);
    static ArrayList<BankAccount> accounts = new ArrayList<>();

    static BankAccount findAccount(int accNo) {
        for (BankAccount acc : accounts) {
            if (acc.accNo == accNo)
                return acc;
        }
        return null;
    }

    // CREATE ACCOUNT
    static void createAccount() {
        System.out.print("Enter Account Number: ");
        int accNo = sc.nextInt();
        sc.nextLine();

        if (findAccount(accNo) != null) {
            System.out.println("Account already exists!");
            return;
        }

        System.out.print("Enter Name: ");
        String name = sc.nextLine();

        System.out.print("Enter Initial Balance: ");
        double balance = sc.nextDouble();

        accounts.add(new BankAccount(accNo, name, balance));
        System.out.println("Account Created Successfully!");
    }

    // DEPOSIT
    static void depositMoney() {
        System.out.print("Enter Account Number: ");
        int accNo = sc.nextInt();

        BankAccount acc = findAccount(accNo);

        if (acc == null) {
            System.out.println("Account not found!");
            return;
        }

        System.out.print("Enter amount: ");
        double amount = sc.nextDouble();
        acc.deposit(amount);
    }

    // WITHDRAW
    static void withdrawMoney() {
        System.out.print("Enter Account Number: ");
        int accNo = sc.nextInt();

        BankAccount acc = findAccount(accNo);

        if (acc == null) {
            System.out.println("Account not found!");
            return;
        }

        System.out.print("Enter amount: ");
        double amount = sc.nextDouble();
        acc.withdraw(amount);
    }

    // VIEW ALL ACCOUNTS
    static void viewAccounts() {
        if (accounts.isEmpty()) {
            System.out.println("No accounts available.");
            return;
        }

        for (BankAccount acc : accounts)
            acc.display();
    }

    // CHECK BALANCE
    static void checkBalance() {
        System.out.print("Enter Account Number: ");
        int accNo = sc.nextInt();

        BankAccount acc = findAccount(accNo);

        if (acc == null) {
            System.out.println("Account not found!");
            return;
        }

        System.out.println("Current Balance: " + acc.balance);
    }

    // DELETE ACCOUNT
    static void deleteAccount() {
        System.out.print("Enter Account Number: ");
        int accNo = sc.nextInt();

        BankAccount acc = findAccount(accNo);

        if (acc == null) {
            System.out.println("Account not found!");
            return;
        }

        accounts.remove(acc);
        System.out.println("Account Deleted Successfully!");
    }

    public static void main(String[] args) {

        while (true) {
            System.out.println("\n===== BANK SYSTEM =====");
            System.out.println("1. Create Account");
            System.out.println("2. Deposit");
            System.out.println("3. Withdraw");
            System.out.println("4. View All Accounts");
            System.out.println("5. Check Balance");
            System.out.println("6. Delete Account");
            System.out.println("7. Exit");

            System.out.print("Enter choice: ");
            int choice = sc.nextInt();

            switch (choice) {
                case 1 -> createAccount();
                case 2 -> depositMoney();
                case 3 -> withdrawMoney();
                case 4 -> viewAccounts();
                case 5 -> checkBalance();
                case 6 -> deleteAccount();
                case 7 -> {
                    System.out.println("Thank you!");
                    return;
                }
                default -> System.out.println("Invalid choice!");
            }
        }
    }
}