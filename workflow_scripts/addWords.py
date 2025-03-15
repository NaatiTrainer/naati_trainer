import pandas as pd

# Load the excel files into a pd database
list_df = pd.read_excel("bangla_words.xlsx")
addWords_df = pd.read_excel("addWords.xlsx")

# Concatenate both DataFrames
merged_df = pd.concat([list_df, addWords_df])

# Drop duplicates based on column 0 and keep the first occurrence
merged_df.drop_duplicates(subset=[list_df.columns[0]], keep="first", inplace=True)

# Save back to list.xlsx
merged_df.to_excel("bangla_words.xlsx", index=False)

print("Merged successfully without duplicates!")