import pandas as pd

# Load both Excel files
list_df = pd.read_excel("Database/bangla_words.xlsx")
addwords_df = pd.read_excel("Database/addWords.xlsx")

# Concatenate both DataFrames
merged_df = pd.concat([list_df, addwords_df])

# Drop duplicates based on column 0 and keep the first occurrence
merged_df.drop_duplicates(subset=[list_df.columns[0]], keep="first", inplace=True)

# Identify rows that were added to list.xlsx
added_rows = merged_df[~merged_df[list_df.columns[0]].isin(list_df[list_df.columns[0]])]

# Remove those rows from addwords.xlsx
addwords_df = addwords_df[~addwords_df[addwords_df.columns[0]].isin(added_rows[added_rows.columns[0]])]

# Save updates
merged_df.to_excel("Database/bangla_words.xlsx", index=False)  # Save updated list.xlsx
addwords_df.to_excel("Database/addWords.xlsx", index=False)  # Save cleaned addwords.xlsx

print("Merged successfully and removed added rows from addwords.xlsx!")
