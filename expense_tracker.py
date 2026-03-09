import tkinter as tk
from tkinter import ttk, messagebox
import csv
import openpyxl

# ---------------------------
# DATA STORAGE
# ---------------------------
expenses = []

# ---------------------------
# ADD EXPENSE
# ---------------------------
def add_expense():
    date = entry_date.get()
    category = entry_category.get()
    amount = entry_amount.get()
    description = entry_description.get()

    if date == "" or category == "" or amount == "":
        messagebox.showerror("Error", "Date, Category and Amount are required")
        return

    expenses.append([date, category, amount, description])
    table.insert("", tk.END, values=(date, category, amount, description))

    entry_date.delete(0, tk.END)
    entry_category.delete(0, tk.END)
    entry_amount.delete(0, tk.END)
    entry_description.delete(0, tk.END)

# ---------------------------
# EXPORT TO TXT
# ---------------------------
def export_txt():
    with open("expenses.txt", "w") as file:
        for exp in expenses:
            file.write(",".join(exp) + "\n")
    messagebox.showinfo("Success", "Exported to expenses.txt")

# ---------------------------
# EXPORT TO CSV
# ---------------------------
def export_csv():
    with open("expenses.csv", "w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["Date", "Category", "Amount", "Description"])
        writer.writerows(expenses)
    messagebox.showinfo("Success", "Exported to expenses.csv")

# ---------------------------
# EXPORT TO EXCEL
# ---------------------------
def export_excel():
    workbook = openpyxl.Workbook()
    sheet = workbook.active
    sheet.append(["Date", "Category", "Amount", "Description"])

    for exp in expenses:
        sheet.append(exp)

    workbook.save("expenses.xlsx")
    messagebox.showinfo("Success", "Exported to expenses.xlsx")

# ---------------------------
# GUI WINDOW
# ---------------------------
root = tk.Tk()
root.title("Expense Tracker")
root.geometry("650x500")

# ---------------------------
# INPUT FIELDS
# ---------------------------
tk.Label(root, text="Date (DD-MM-YYYY)").pack()
entry_date = tk.Entry(root)
entry_date.pack()

tk.Label(root, text="Category").pack()
entry_category = tk.Entry(root)
entry_category.pack()

tk.Label(root, text="Amount").pack()
entry_amount = tk.Entry(root)
entry_amount.pack()

tk.Label(root, text="Description").pack()
entry_description = tk.Entry(root)
entry_description.pack()

tk.Button(root, text="Add Expense", command=add_expense).pack(pady=10)

# ---------------------------
# TABLE VIEW
# ---------------------------
columns = ("Date", "Category", "Amount", "Description")
table = ttk.Treeview(root, columns=columns, show="headings")

for col in columns:
    table.heading(col, text=col)
    table.column(col, width=150)

table.pack(expand=True, fill="both")

# ---------------------------
# EXPORT BUTTONS
# ---------------------------
frame = tk.Frame(root)
frame.pack(pady=10)

tk.Button(frame, text="Export TXT", command=export_txt).pack(side="left", padx=5)
tk.Button(frame, text="Export CSV", command=export_csv).pack(side="left", padx=5)
tk.Button(frame, text="Export Excel", command=export_excel).pack(side="left", padx=5)

# ---------------------------
# RUN APP
# ---------------------------
root.mainloop()
