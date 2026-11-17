import type { RawQuestion } from "../types";

/* Reusable code snippets (plain T-SQL — highlighting is automatic). */
const FULL_CODE = `-- Get the names of customers from Italy
SELECT
    name,
    LOWER(country) AS country
FROM customers
WHERE country = 'Italy';`;

const WHERE_CODE = `WHERE country = 'Italy'`;

const COMMENT_CODE = `-- Get the names of customers from Italy
SELECT name FROM customers;`;

export const COMPONENTS_QUESTIONS: RawQuestion[] = [
  /* ---------------- STATEMENTS (6) ---------------- */
  {
    topic: "Statements",
    q: "Look at the code below. What do we call the WHOLE thing — all of this code together, from the first line to the last?",
    code: FULL_CODE,
    options: ["A statement (also called a query)", "A clause", "A keyword", "A comment"],
    answer: "A statement (also called a query)",
    hint: "Think of the whole code as ONE complete instruction you give to the database — like one full sentence. The sections inside it have different names.",
    explain:
      "All of this code together is one complete instruction to the database. We call it a statement, or a query — both words mean the same thing. It starts with SELECT, so it is a SELECT statement. A clause is only ONE section inside the statement (like WHERE), and a keyword is just one blue word (like FROM). Neither of them is the whole code.",
    tip: "Statement = query = the WHOLE code. A clause is one section inside it; a keyword is one reserved word.",
  },
  {
    topic: "Statements",
    q: "Why do we call this code a SELECT statement?",
    code: FULL_CODE,
    options: [
      "Because it starts with the SELECT keyword",
      "Because it has three clauses",
      "Because it uses the customers table",
      "Because it filters rows from Italy",
    ],
    answer: "Because it starts with the SELECT keyword",
    hint: "Look at the very first blue word of the code. Statements are named after that first word.",
    explain:
      "A statement gets its name from the keyword it starts with. This code starts with SELECT, so it is a SELECT statement. Code that starts with INSERT is an INSERT statement, code that starts with CREATE is a CREATE statement, and so on.",
    tip: "The first keyword gives the statement its name.",
  },
  {
    topic: "Statements",
    q: "What is the difference between a statement and a clause?",
    options: [
      "A statement is the whole code; a clause is one section inside it",
      "They are two names for exactly the same thing",
      "A clause is the whole code; a statement is one section inside it",
      "A statement is only the green comment part",
    ],
    answer: "A statement is the whole code; a clause is one section inside it",
    hint: "One of them is the complete 'sentence' you send to the database. The other is just one part of that sentence.",
    explain:
      "The statement (query) is the complete code you send to the database. Inside it, each main section is a clause. Our example is ONE statement that contains THREE clauses: SELECT, FROM and WHERE. So a statement is the whole thing, and a clause is a piece of it.",
    tip: "Whole code = statement. Each section inside it = clause.",
    difficulty: "medium",
  },
  {
    topic: "Statements",
    q: "In this lesson, what is the relationship between the words 'query' and 'statement'?",
    options: [
      "Two names for the same thing — the whole SQL code",
      "A query is bigger than a statement",
      "A statement is one word; a query is the whole code",
      "A query only means SELECT; a statement only means INSERT",
    ],
    answer: "Two names for the same thing — the whole SQL code",
    hint: "The teacher says: 'we call the whole thing an SQL statement, query'. Two words, one idea.",
    explain:
      "In this course, statement and query are synonyms: both mean the complete SQL code you send to the database. You will hear both words everywhere — 'run this query' and 'run this statement' mean the same action.",
    tip: "Query = statement. Same thing, two names.",
  },
  {
    topic: "Statements",
    q: "Which of these is a COMPLETE statement that SQL Server can run?",
    options: ["SELECT name FROM customers;", "FROM customers", "WHERE country = 'Italy'", "LOWER(country)"],
    answer: "SELECT name FROM customers;",
    hint: "A complete statement needs a command and its parts — not just one section or one tool.",
    explain:
      "SELECT name FROM customers; is a complete instruction: it says what to get (name) and where from (customers). The others are only pieces: FROM customers is one clause, WHERE country = 'Italy' is another clause, and LOWER(country) is just a function call. Pieces cannot run alone.",
    tip: "A statement runs; a lone clause or function is only a piece.",
    difficulty: "medium",
  },
  {
    topic: "Statements",
    q: "Do these components (clauses, keywords, values…) appear ONLY in SELECT statements?",
    options: [
      "No — they are the basic parts of ALL SQL code, like INSERT, CREATE and DELETE too",
      "Yes — only SELECT statements have them",
      "Only comments appear in other statements",
      "Only functions appear in other statements",
    ],
    answer: "No — they are the basic parts of ALL SQL code, like INSERT, CREATE and DELETE too",
    hint: "Think about an INSERT statement: does it also have keywords, a table name, and values that you type in?",
    explain:
      "The same basic components build every SQL statement. An INSERT statement also has keywords, clauses, identifiers (table and column names) and static values (the data you insert). Learn these parts once, and you can read any SQL code.",
    tip: "One set of building blocks → every SQL statement.",
  },
  /* ---------------- COMMENTS (6) ---------------- */
  {
    topic: "Comments",
    q: "Which part of this code is only a note for humans — the part that SQL will NOT run?",
    code: COMMENT_CODE,
    options: ["The comment", "The clause", "The static value", "The function"],
    answer: "The comment",
    hint: "It is the green line that starts with two dashes (--). It talks to people, not to the database.",
    explain:
      "A comment is a note you write for yourself or for other people reading the code. SQL Server completely ignores it when it runs — it never changes the results. In SSMS, comments are green and start with two dashes (--).",
    tip: "-- starts a comment. Green text = SQL Server skips it.",
  },
  {
    topic: "Comments",
    q: "What happens when SQL Server runs a query that contains a comment?",
    options: [
      "It ignores the comment completely and runs the rest",
      "It stops and shows an error",
      "It prints the comment in the results table",
      "It runs the comment first, then the query",
    ],
    answer: "It ignores the comment completely and runs the rest",
    hint: "Comments talk to humans. The database engine does not care about them at all.",
    explain:
      "SQL Server skips every comment and executes only the real code. A comment never causes an error, never appears in the results, and never changes what the query does. You can add or remove comments freely — the results stay identical.",
    tip: "Comments = zero effect on execution and results.",
  },
  {
    topic: "Comments",
    q: "What do the two dashes (--) do at the start of a line in SSMS?",
    code: COMMENT_CODE,
    options: [
      "They start a comment — the rest of that line is ignored",
      "They subtract two numbers",
      "They end the statement",
      "They mark a keyword",
    ],
    answer: "They start a comment — the rest of that line is ignored",
    hint: "Look at the color of the line that starts with --. Green means SQL Server skips it.",
    explain:
      "Two dashes start a single-line comment: everything after them on that line is ignored by SQL Server. That is why the whole line turns green in SSMS. (A single dash - is the subtraction operator; two dashes together are something completely different.)",
    tip: "-- = comment to the end of the line. One - = minus.",
  },
  {
    topic: "Comments",
    q: "SQL Server bonus: you want to write a comment that spans several lines. Which syntax works in SQL Server?",
    options: ["/* comment */", "-- comment --", "// comment //", "# comment #"],
    answer: "/* comment */",
    hint: "One comment style uses two dashes for a single line. The other opens with a slash and a star, and closes with a star and a slash.",
    explain:
      "SQL Server supports two comment styles: -- comments out one line, and /* … */ comments out everything between the markers — even across many lines. The // and # styles belong to other programming languages, not SQL Server. And -- only needs to be at the start: everything after it on that line is ignored.",
    tip: "-- = one line · /* … */ = many lines. Both are skipped by SQL Server.",
    difficulty: "hard",
  },
  {
    topic: "Comments",
    q: "Why do developers write comments in their SQL code?",
    options: [
      "To explain the code for humans reading it later",
      "To make the query run faster",
      "To tell SQL Server which table to use",
      "To hide errors from SQL Server",
    ],
    answer: "To explain the code for humans reading it later",
    hint: "Our example comment says: 'Get the names of customers from Italy'. Who is that message for?",
    explain:
      "Comments document the intent of the code — like '-- Get the names of customers from Italy'. They help you and your teammates understand the query later. They do not affect speed, they cannot instruct SQL Server, and they cannot hide errors.",
    tip: "Comments explain WHY, for people. The engine ignores them.",
  },
  {
    topic: "Comments",
    q: "In the default SSMS colors, what color is a comment?",
    options: ["Green", "Blue", "Red", "Magenta (pink)"],
    answer: "Green",
    hint: "Think of the first line of the example query — the note that starts with --.",
    explain:
      "In SSMS, comments are green. The other colors have their own meanings: blue is for keywords, red is for text values like 'Italy', and magenta (pink) is for built-in functions like LOWER. Colors help you recognize each component at a glance.",
    tip: "Green = comment · Blue = keyword · Red = value · Magenta = function.",
  },
  /* ---------------- CLAUSES (9) ---------------- */
  {
    topic: "Clauses",
    q: "This query has three main sections: SELECT…, FROM… and WHERE…. What is each section called?",
    code: FULL_CODE,
    options: ["A clause", "A comment", "An operator", "A function"],
    answer: "A clause",
    hint: "Each section has one specific job: one picks the columns, one picks the table, one filters the rows.",
    explain:
      "Each main section of a query is called a clause, and every clause has one specific job. The SELECT clause chooses which columns to show. The FROM clause chooses which table to read. The WHERE clause filters which rows to keep.",
    tip: "SELECT = columns · FROM = table · WHERE = filter.",
  },
  {
    topic: "Clauses",
    q: "What is the job of the SELECT clause?",
    options: [
      "To choose which columns to show",
      "To choose which table to read",
      "To filter the rows",
      "To write notes for humans",
    ],
    answer: "To choose which columns to show",
    hint: "In the example, the result shows name and a lowercased country. Which section decided that?",
    explain:
      "The SELECT clause is all about columns: it lists exactly what you want to see in the result. In our query it returns name and LOWER(country). The table comes from FROM, and row filtering comes from WHERE.",
    tip: "SELECT = which columns. FROM = which table. WHERE = which rows.",
  },
  {
    topic: "Clauses",
    q: "Which clause filters the data — it decides which rows to keep?",
    options: ["WHERE", "SELECT", "FROM", "LOWER"],
    answer: "WHERE",
    hint: "Filtering means keeping only the rows that match a condition — for example, only the customers from Italy.",
    explain:
      "The WHERE clause filters rows: only the rows that pass its condition are returned. In our query, WHERE country = 'Italy' keeps only the Italian customers. SELECT picks columns and FROM picks the table — they do not filter anything. (LOWER is not a clause at all — it is a function.)",
    tip: "WHERE = filter rows. SELECT = pick columns. FROM = pick table.",
  },
  {
    topic: "Clauses",
    q: "What is the job of the FROM clause?",
    options: [
      "To say which table the data comes from",
      "To choose which columns to show",
      "To filter the rows",
      "To sort the results",
    ],
    answer: "To say which table the data comes from",
    hint: "In the example, the data comes from the customers table. Which keyword put that table into the query?",
    explain:
      "FROM tells SQL where to read the data from — which table to use. In our query, FROM customers means: go to the customers table and get the data from there. Choosing columns is SELECT's job, and filtering rows is WHERE's job.",
    tip: "FROM = the source table.",
  },
  {
    topic: "Clauses",
    q: "In the example query, which part makes the result show ONLY Italian customers?",
    code: FULL_CODE,
    options: ["WHERE country = 'Italy'", "SELECT name", "FROM customers", "The green comment line"],
    answer: "WHERE country = 'Italy'",
    hint: "Showing only some rows = filtering. Which clause has the filtering job?",
    explain:
      "WHERE country = 'Italy' is the filter: it keeps only rows whose country is Italy. SELECT name only decides which column to show, FROM customers only names the table, and the comment does nothing at all — SQL Server skips it.",
    tip: "Only some rows in the result? That is WHERE's work.",
  },
  {
    topic: "Clauses",
    q: "You want to read data from the customers table. Which piece of code do you need?",
    options: ["FROM customers", "SELECT customers", "WHERE customers", "LOWER(customers)"],
    answer: "FROM customers",
    hint: "One clause has exactly one job: naming the source table.",
    explain:
      "FROM customers tells SQL Server to read from the customers table. SELECT customers would ask for a COLUMN called customers, WHERE customers is not a valid condition, and LOWER(customers) would try to lowercase a table name — none of them selects the table.",
    tip: "To pick the table: FROM + table name.",
    difficulty: "medium",
  },
  {
    topic: "Clauses",
    q: "How many clauses does the example query have?",
    code: FULL_CODE,
    options: [
      "Three — SELECT, FROM and WHERE",
      "One — the whole query is one clause",
      "Two — SELECT and FROM",
      "Five — one for every line",
    ],
    answer: "Three — SELECT, FROM and WHERE",
    hint: "Count the main sections, not the lines. The comment is not a clause, and one clause can span several lines.",
    explain:
      "The query has three clauses: SELECT, FROM and WHERE. The whole query is one STATEMENT (not one clause), the comment is not a clause, and lines do not matter — the SELECT clause here spans three lines but is still a single clause.",
    tip: "Count sections, not lines: SELECT + FROM + WHERE = 3 clauses.",
    difficulty: "medium",
  },
  {
    topic: "Clauses",
    q: "True or false: a clause is a complete instruction that can run on its own.",
    options: [
      "False — a clause is only one section of a statement",
      "True — each clause runs separately",
      "True — but only the WHERE clause",
      "False — a clause is just a single keyword",
    ],
    answer: "False — a clause is only one section of a statement",
    hint: "Try sending only 'WHERE country = Italy' to the database. Would it know what to do?",
    explain:
      "A clause cannot run alone — it is one section of a statement, and the sections work together. WHERE country = 'Italy' by itself is incomplete: SQL Server would not know what to select or from where. A clause is also more than one keyword: it is the keyword plus its content.",
    tip: "Clauses are pieces. Only the full statement runs.",
    difficulty: "medium",
  },
  {
    topic: "Clauses",
    q: "In what order do the three clauses appear in the lesson's query?",
    code: FULL_CODE,
    options: ["SELECT → FROM → WHERE", "FROM → SELECT → WHERE", "WHERE → FROM → SELECT", "SELECT → WHERE → FROM"],
    answer: "SELECT → FROM → WHERE",
    hint: "Read the blue words from top to bottom.",
    explain:
      "The written order in the example is SELECT first (the columns), then FROM (the table), then WHERE (the filter). This is the standard way we write a basic query in this course — columns, source, condition.",
    tip: "Written order: SELECT → FROM → WHERE.",
  },
  /* ---------------- KEYWORDS (7) ---------------- */
  {
    topic: "Keywords",
    q: "What do we call SQL's special reserved words like SELECT, FROM and WHERE — the blue words in SSMS?",
    options: ["Keywords", "Identifiers", "Comments", "Static values"],
    answer: "Keywords",
    hint: "These words belong to the SQL language itself. You cannot use them as names for your own tables.",
    explain:
      "Keywords are reserved words that belong to the SQL language itself. Each one gives a command or defines an operation, and in SSMS (SQL Server's editor) they are shown in blue. Because they are reserved for SQL, you should not use them as names for your own tables or columns.",
    tip: "Blue word = keyword = a reserved SQL word with a special job.",
  },
  {
    topic: "Keywords",
    q: "What is the best practice when you write keywords?",
    options: [
      "Write them in UPPERCASE, like SELECT",
      "Write them in lowercase, like select",
      "Put them inside quotes, like 'SELECT'",
      "Put -- in front of them",
    ],
    answer: "Write them in UPPERCASE, like SELECT",
    hint: "The lesson says: every time you write a blue word, make it fully capitalized.",
    explain:
      "Writing keywords in UPPERCASE makes the code easier to read: you instantly see the SQL commands (SELECT, FROM, WHERE) separated from your own names (name, country, customers). SQL also accepts lowercase — the code still runs — but UPPERCASE is the best practice we follow in the whole course. (Quotes would turn it into a value, and -- would turn it into a comment!)",
    tip: "Keywords UPPERCASE — your own names lowercase.",
  },
  {
    topic: "Keywords",
    q: "Which group contains ONLY keywords?",
    options: ["SELECT, FROM, WHERE, AS", "name, country, customers", "'Italy', 'Germany'", "LOWER(country), ="],
    answer: "SELECT, FROM, WHERE, AS",
    hint: "Keywords are the blue reserved words. Names are black, values are red.",
    explain:
      "SELECT, FROM, WHERE and AS are all reserved SQL words — all blue in SSMS. The group name, country, customers contains identifiers (black names). 'Italy' and 'Germany' are static values (red). LOWER is a function and = is an operator.",
    tip: "If every word in the group is blue — it is a keyword group.",
  },
  {
    topic: "Keywords",
    q: "Why should you NOT name your own table 'SELECT'?",
    options: [
      "SELECT is a reserved keyword — SQL Server needs it for commands",
      "Keywords are too short to be table names",
      "Table names must always be lowercase",
      "You can — keywords are free to use as names",
    ],
    answer: "SELECT is a reserved keyword — SQL Server needs it for commands",
    hint: "The word 'reserved' means the language has already claimed it.",
    explain:
      "Reserved words already have a job in the SQL language, so using them as names confuses the parser and causes errors or forces awkward escaping with [brackets]. Length and letter case do not matter — the problem is that SELECT belongs to SQL Server, not to you.",
    tip: "Reserved = claimed by SQL. Do not reuse keywords as names.",
    difficulty: "medium",
  },
  {
    topic: "Keywords",
    q: "Does SQL Server still run your query if you write keywords in lowercase, like select?",
    options: [
      "Yes — it runs, but UPPERCASE is the best practice for readability",
      "No — lowercase keywords cause an error",
      "Only if the table names are also lowercase",
      "Only inside comments",
    ],
    answer: "Yes — it runs, but UPPERCASE is the best practice for readability",
    hint: "Best practice is about humans reading the code, not about the engine understanding it.",
    explain:
      "SQL Server understands select just as well as SELECT — the query runs either way. UPPERCASE is a convention for people: it makes the commands stand out from your own names. The course uses UPPERCASE everywhere so the code is easy to scan.",
    tip: "Lowercase runs, UPPERCASE reads better. Follow the convention.",
  },
  {
    topic: "Keywords",
    q: "In the code below, which words are keywords?",
    code: FULL_CODE,
    options: ["SELECT, AS, FROM, WHERE", "name, country, customers", "LOWER and 'Italy'", "The words in the comment"],
    answer: "SELECT, AS, FROM, WHERE",
    hint: "Count the blue words. AS is blue too — it gives the transformed column its name.",
    explain:
      "The blue reserved words here are SELECT, AS, FROM and WHERE. AS is also a keyword: it renames the output of LOWER(country) to country. name, country and customers are identifiers (black), LOWER is a function (magenta), 'Italy' is a value (red), and comment words are ignored.",
    tip: "Blue = keyword. Even small words like AS count.",
    difficulty: "medium",
  },
  {
    topic: "Keywords",
    q: "What color does SSMS use for keywords?",
    options: ["Blue", "Green", "Red", "Black"],
    answer: "Blue",
    hint: "SELECT, FROM, WHERE — what color are they in the example?",
    explain:
      "Keywords are blue in the default SSMS colors. Green is for comments, red is for text values, and black is for identifiers like table and column names. Once you know the colors, you can identify every component at a glance.",
    tip: "Blue = keyword. Green = comment. Red = value. Black = name.",
  },
  /* ---------------- FUNCTIONS (6) ---------------- */
  {
    topic: "Functions",
    q: "LOWER(country) takes the country values and turns them into lowercase letters. What kind of component is LOWER?",
    code: "LOWER(country)",
    options: ["A function", "An identifier", "A clause", "A static value"],
    answer: "A function",
    hint: "It takes an input, does something to it, and gives back an output — like a small machine.",
    explain:
      "LOWER is a function — a special built-in tool in SQL. A function accepts an input (here: the country value), processes it (makes every letter lowercase), and returns an output. For example, 'ITALY' becomes 'italy'. It is not an identifier, because it is not the name of a table or column — it is a built-in SQL tool.",
    tip: "Function: input → process → output. LOWER('ITALY') = 'italy'.",
  },
  {
    topic: "Functions",
    q: "What are the three steps of every function?",
    options: ["Input → process → output", "Select → from → where", "Open → save → close", "Comment → keyword → value"],
    answer: "Input → process → output",
    hint: "A function is like a small machine: something goes in, something happens, something comes out.",
    explain:
      "Every function accepts an input, processes it, and returns an output. LOWER takes 'ITALY' (input), makes every letter lowercase (process), and returns 'italy' (output). SELECT, FROM and WHERE are clauses — not the steps of a function.",
    tip: "Function = input → process → output.",
  },
  {
    topic: "Functions",
    q: "What is the output of this function call?",
    code: "LOWER('GERMANY')",
    options: ["'germany'", "'GERMANY'", "'Germany'", "An error"],
    answer: "'germany'",
    hint: "LOWER makes EVERY letter lowercase — not just the first one.",
    explain:
      "LOWER('GERMANY') returns 'germany' — every single letter becomes lowercase. 'Germany' (only the first letter capital) would be a different transformation, and there is no error: 'GERMANY' is a perfectly valid text input.",
    tip: "LOWER = all letters lowercase. 'GERMANY' → 'germany'.",
  },
  {
    topic: "Functions",
    q: "In LOWER(country), what is the INPUT of the function?",
    code: "LOWER(country)",
    options: ["The country column's values", "The word LOWER", "The customers table", "The value 'Italy'"],
    answer: "The country column's values",
    hint: "The input goes inside the parentheses ( ).",
    explain:
      "Whatever is inside the parentheses is the input: here, the country column. For every row, SQL Server takes that row's country value, lowercases it, and returns it. LOWER is the tool itself, and 'Italy' lives in the WHERE clause — it is not the function's input.",
    tip: "Input = what is inside ( ). Output = what comes back.",
    difficulty: "medium",
  },
  {
    topic: "Functions",
    q: "SQL Server bonus: which function would make the country values UPPERCASE?",
    options: ["UPPER(country)", "LOWER(country)", "BIG(country)", "CAPS(country)"],
    answer: "UPPER(country)",
    hint: "The opposite of LOWER has a very logical name.",
    explain:
      "UPPER is the opposite of LOWER: it takes the input and returns it with every letter in uppercase — 'italy' becomes 'ITALY'. BIG and CAPS are not SQL Server functions; they are invented names. LOWER does the reverse job.",
    tip: "LOWER → lowercase · UPPER → UPPERCASE.",
    difficulty: "hard",
  },
  {
    topic: "Functions",
    q: "Is LOWER a clause — or something else?",
    code: "LOWER(country)",
    options: [
      "Something else — it is a built-in function used INSIDE the SELECT clause",
      "Yes — it is the fourth clause of the query",
      "Yes — every word in parentheses starts a clause",
      "It is a table name",
    ],
    answer: "Something else — it is a built-in function used INSIDE the SELECT clause",
    hint: "Clauses are the big sections (SELECT, FROM, WHERE). Functions are small tools that live inside them.",
    explain:
      "LOWER is a function, not a clause. It sits inside the SELECT clause and transforms one column's values. Clauses are the main sections of the statement; functions are built-in tools you can use within those sections. The query still has exactly three clauses.",
    tip: "Clauses = sections. Functions = tools used inside sections.",
    difficulty: "medium",
  },
  /* ---------------- IDENTIFIERS (6) ---------------- */
  {
    topic: "Identifiers",
    q: "The black words name, country and customers are… what?",
    code: "SELECT name, country FROM customers",
    options: [
      "Identifiers — names of columns and tables",
      "Keywords — reserved SQL words",
      "Comments — notes for humans",
      "Operators — they compare values",
    ],
    answer: "Identifiers — names of columns and tables",
    hint: "They are not part of the SQL language. They are names of things inside THIS database.",
    explain:
      "Identifiers are simply the names of things in your database. Here, name and country are column names, and customers is a table name. Unlike keywords, these names are not reserved SQL words — they were chosen by the person who created the database. SQL Server tip: if a name contains a space or a reserved word, you can wrap it in square brackets, like [first name].",
    tip: "Identifier = a name of a table or a column in your database.",
  },
  {
    topic: "Identifiers",
    q: "In FROM customers, what is the word customers?",
    options: ["A table name — an identifier", "A keyword", "A static value", "A function"],
    answer: "A table name — an identifier",
    hint: "FROM's job is to name the source table. So what must the word after FROM be?",
    explain:
      "customers is the name of the table the data comes from — an identifier. FROM is the keyword (blue), customers is your database's own name for a table (black). It is not a value, because it is not in quotes, and not a function, because it does not transform anything.",
    tip: "After FROM comes a table name — an identifier.",
  },
  {
    topic: "Identifiers",
    q: "In this line, what is country (the word WITHOUT quotes)?",
    code: WHERE_CODE,
    options: ["A column name — an identifier", "A static value", "A keyword", "An operator"],
    answer: "A column name — an identifier",
    hint: "No quotes + black color = a name from the database. Quotes + red = a value you typed.",
    explain:
      "country without quotes is a column name — an identifier. It tells SQL Server which column to check in each row. Compare it with 'Italy': single quotes and red color mark a static value you typed. Same line, two different components.",
    tip: "country = identifier (name). 'Italy' = static value (text).",
    difficulty: "medium",
  },
  {
    topic: "Identifiers",
    q: "Who chooses the identifiers (table and column names) in a database?",
    options: [
      "The person who creates the tables and columns",
      "SQL Server invents them automatically",
      "They are fixed reserved words of the SQL language",
      "SSMS assigns them randomly",
    ],
    answer: "The person who creates the tables and columns",
    hint: "Keywords belong to the language. Names belong to… whoever designed the database.",
    explain:
      "Identifiers are custom names chosen by the database designer — someone decided to call the table customers and the columns name and country. Keywords, in contrast, are fixed by the SQL language itself and are the same in every database.",
    tip: "Keywords = fixed by SQL. Identifiers = chosen by people.",
  },
  {
    topic: "Identifiers",
    q: "What color are identifiers like name and customers in the default SSMS colors?",
    options: ["Black (normal text)", "Blue", "Green", "Red"],
    answer: "Black (normal text)",
    hint: "The lesson calls them 'those black words'. They are your database's own names.",
    explain:
      "Identifiers appear in black — normal text color. Blue is reserved for keywords, green for comments, red for text values, magenta for functions. Black means: this is a name from your database, not a word from the SQL language.",
    tip: "Black = identifier (your database's names).",
  },
  {
    topic: "Identifiers",
    q: "SQL Server bonus: a column is called first name — with a space in the middle. How can you write it safely in a query?",
    options: ["[first name] — square brackets", "'first name' — single quotes", "(first name) — parentheses", "-- first name"],
    answer: "[first name] — square brackets",
    hint: "SQL Server has a special wrapper for names that contain spaces or reserved words. It is not quotes — quotes make values.",
    explain:
      "Square brackets tell SQL Server: everything inside is ONE identifier, even with a space — [first name]. Single quotes would make it a text VALUE instead of a column name, parentheses are for functions and grouping, and -- would turn the line into a comment.",
    tip: "[brackets] = names with spaces or reserved words. 'quotes' = values.",
    difficulty: "hard",
  },
  /* ---------------- OPERATORS (5) ---------------- */
  {
    topic: "Operators",
    q: "Look at this line. What is the = sign doing here?",
    code: WHERE_CODE,
    options: [
      "It is an operator — it compares two values",
      "It is a function — it changes a value",
      "It is a keyword — it starts a clause",
      "It is an identifier — it names a column",
    ],
    answer: "It is an operator — it compares two values",
    hint: "On the left side is the country column. On the right side is 'Italy'. The = sign sits between them and asks a question.",
    explain:
      "The = sign is an operator. Operators compare two values — here it asks: is country equal to 'Italy'? Only rows where the answer is true are kept. Operators are usually used inside the WHERE clause, because that is where we filter rows.",
    tip: "Operator = compares two values (=, >, <, …), usually inside WHERE.",
  },
  {
    topic: "Operators",
    q: "Where do operators usually appear in the lesson's query?",
    options: ["Inside the WHERE clause", "Inside the comment", "Inside the FROM clause", "Before the SELECT keyword"],
    answer: "Inside the WHERE clause",
    hint: "Operators compare values to decide which rows to keep. Which clause has that job?",
    explain:
      "Operators live mainly in the WHERE clause, because filtering means comparing: country = 'Italy' compares each row's country with 'Italy' and keeps the matches. The comment is ignored, FROM only names the table, and nothing comes before SELECT except comments.",
    tip: "Filtering needs comparisons → operators live in WHERE.",
  },
  {
    topic: "Operators",
    q: "In this line, which TWO things does the = sign compare?",
    code: WHERE_CODE,
    options: [
      "The country column's value and the text 'Italy'",
      "The name column and the country column",
      "The customers table and the value 'Italy'",
      "The SELECT clause and the FROM clause",
    ],
    answer: "The country column's value and the text 'Italy'",
    hint: "Look at what is on the LEFT of = and what is on the RIGHT.",
    explain:
      "An operator compares its left side with its right side. Left: the country column's value in the current row. Right: the static value 'Italy'. If they are equal, the row is kept; if not, the row is filtered out. This happens for every row in the table.",
    tip: "Left side vs right side — row by row.",
    difficulty: "medium",
  },
  {
    topic: "Operators",
    q: "SQL Server bonus: which operator keeps rows where the value is NOT equal to something?",
    options: ["<>", "><", "=>", "=="],
    answer: "<>",
    hint: "It looks like a less-than and a greater-than pushed together, pointing away from each other.",
    explain:
      "<> is the standard 'not equal' operator in SQL Server — WHERE country <> 'Italy' keeps every customer NOT from Italy. (SQL Server also accepts != for the same job.) The combinations ><, => and == are not SQL Server operators.",
    tip: "= equal · <> not equal (also written !=).",
    difficulty: "hard",
  },
  {
    topic: "Operators",
    q: "In this query, is the = sign CHANGING data or COMPARING data?",
    code: WHERE_CODE,
    options: [
      "Comparing — it checks if country equals 'Italy'",
      "Assigning — it puts 'Italy' into the country column",
      "Deleting — it removes the country column",
      "Renaming — it renames the column to Italy",
    ],
    answer: "Comparing — it checks if country equals 'Italy'",
    hint: "A SELECT statement only READS data. It never changes what is stored in the table.",
    explain:
      "Inside WHERE, = asks a question: is country equal to 'Italy'? It never writes anything. The whole query is a SELECT statement, and SELECT only reads data — the customers table stays exactly as it was. Nothing is assigned, deleted or renamed.",
    tip: "In WHERE, = asks a question. SELECT never changes data.",
  },
  /* ---------------- STATIC VALUES (5) ---------------- */
  {
    topic: "Static values",
    q: "What do we call 'Italy' — the fixed red text written inside the query?",
    code: WHERE_CODE,
    options: ["A static value", "An identifier", "A keyword", "A comment"],
    answer: "A static value",
    hint: "It is not a name from the database and not a SQL command. It is a fixed piece of text that you typed yourself.",
    explain:
      "'Italy' is a static value: a fixed value that you write directly into the query yourself. It does not come from the database and it does not change while the query runs. In SQL Server, text values always go inside single quotes. Notice the difference: country (no quotes, black) is a column name, but 'Italy' (single quotes, red) is a value you typed.",
    tip: "Single quotes + red = a fixed value you typed, like 'Italy'.",
  },
  {
    topic: "Static values",
    q: "Why is 'Italy' called a STATIC value?",
    code: WHERE_CODE,
    options: [
      "Because it is fixed — you typed it, and it stays the same while the query runs",
      "Because it comes from the customers table",
      "Because SQL Server generates it randomly",
      "Because it is a reserved keyword",
    ],
    answer: "Because it is fixed — you typed it, and it stays the same while the query runs",
    hint: "Static is the opposite of changing. Column values change row by row — does 'Italy'?",
    explain:
      "Static means fixed. The country column has a different value in every row, but 'Italy' is the same in every comparison — you typed it, and it never changes during execution. It does not come from the table, and it is not random or reserved.",
    tip: "Static = fixed text you typed. Column values = change per row.",
    difficulty: "medium",
  },
  {
    topic: "Static values",
    q: "SQL Server bonus: which is the correct way to write the text value Italy inside a query?",
    code: WHERE_CODE,
    options: ["'Italy' — single quotes", '"Italy" — double quotes', "[Italy] — square brackets", "Italy — no quotes"],
    answer: "'Italy' — single quotes",
    hint: "Look at the red value in WHERE country = 'Italy'. What is wrapped around it?",
    explain:
      "In SQL Server (T-SQL), text values go inside single quotes: 'Italy'. Square brackets [Italy] mark a name (an identifier), not a value — and Italy without any quotes would also be read as a column name. Double quotes are normally used for identifiers too, so single quotes are the safe, standard way to write text values.",
    tip: "Text values = single quotes '…' · [square brackets] = names, not values.",
    difficulty: "hard",
  },
  {
    topic: "Static values",
    q: "What color does SSMS show for text values like 'Italy'?",
    options: ["Red", "Blue", "Green", "Black"],
    answer: "Red",
    hint: "The lesson calls 'Italy' 'the red value'.",
    explain:
      "Text values in single quotes are red in the default SSMS colors. Blue marks keywords, green marks comments, and black marks identifiers. So when you see red, you know: this is fixed text someone typed into the query.",
    tip: "Red = static text value in single quotes.",
  },
  {
    topic: "Static values",
    q: "Which of these is a static value?",
    options: [
      "'Germany' — text you typed in single quotes",
      "country — a column name",
      "customers — a table name",
      "WHERE — a keyword",
    ],
    answer: "'Germany' — text you typed in single quotes",
    hint: "Look for single quotes and imagine the color: red = value.",
    explain:
      "'Germany' is a static value: fixed text in single quotes, shown in red. country and customers are identifiers — names from the database (black). WHERE is a keyword — a reserved SQL word (blue). Only the quoted text is a value you typed.",
    tip: "Quotes make it a value. No quotes = a name or a keyword.",
  },
  {
    topic: "Clauses",
    format: "true-false",
    q: "True or false: a WHERE clause filters which rows a query returns.",
    options: ["True", "False"],
    answer: "True",
    hint: "Think about the Italy condition in the example query.",
    explain: "WHERE evaluates a condition for each row and keeps the rows that match.",
    difficulty: "easy",
  },
  {
    topic: "Clauses",
    format: "short-answer",
    q: "Fill in the blank: which clause filters rows? ____ country = 'Italy';",
    options: [],
    answer: "WHERE",
    hint: "It is the clause that applies a condition to rows.",
    explain: "WHERE filters rows by applying a condition, such as country = 'Italy'.",
    difficulty: "easy",
  },
  {
    topic: "Query structure",
    format: "matching",
    q: "Match each SQL clause to its job.",
    options: ["Filter rows", "Choose columns", "Choose the table"],
    matchPairs: [
      { left: "SELECT", right: "Choose columns" },
      { left: "FROM", right: "Choose the table" },
      { left: "WHERE", right: "Filter rows" },
    ],
    answer: JSON.stringify(["Choose columns", "Choose the table", "Filter rows"]),
    hint: "SELECT chooses output columns, FROM names the source, and WHERE filters rows.",
    explain: "These three clauses divide a basic query into choosing columns, naming a table, and filtering rows.",
    difficulty: "medium",
  },
  {
    topic: "Coding",
    format: "coding",
    q: "Write a T-SQL query that returns customer names for customers in Italy.",
    options: [],
    answer: "SELECT name FROM customers WHERE country = 'Italy';",
    acceptedAnswers: ["SELECT name FROM customers WHERE country='Italy'"],
    hint: "Use SELECT for the name column, FROM for customers, and WHERE for the country condition.",
    explain: "The query selects name from customers and keeps only rows whose country is Italy. This checks the written SQL text; it does not execute it against a database.",
    difficulty: "medium",
  },
  {
    topic: "Applied scenarios",
    format: "scenario",
    context: "A report currently lists customers from every country. A manager only wants to see customers from Italy.",
    q: "Which clause should you add to filter the report to Italian customers?",
    options: [
      "Add WHERE country = 'Italy'",
      "Replace SELECT with Italy",
      "Remove the FROM clause",
      "Add AS Italy",
    ],
    answer: "Add WHERE country = 'Italy'",
    scenarioBranches: [
      { choice: "Add WHERE country = 'Italy'", outcome: "The result is filtered to Italian customers, as requested." },
      { choice: "Replace SELECT with Italy", outcome: "The query no longer selects the requested customer column." },
      { choice: "Remove the FROM clause", outcome: "Without a source table, SQL Server cannot read the customer rows." },
      { choice: "Add AS Italy", outcome: "AS can name an output column; it does not filter rows." },
    ],
    hint: "Choose the clause whose job is filtering rows.",
    explain: "WHERE applies a condition to rows, so WHERE country = 'Italy' keeps only Italian customers.",
    difficulty: "medium",
  },
];
