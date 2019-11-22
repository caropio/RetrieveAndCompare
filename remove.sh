git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch php/connectDB.php" \
  --prune-empty --tag-name-filter cat -- --all
