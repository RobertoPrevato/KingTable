Example of PHP MySQL integration with KingTable library.

## Credits
This example was kindly prepared by GitHub user [ad2sound](https://github.com/hadiarakos).

## Steps.

1. Create a database and run users.sql (This will create `kt_users` table with dummy data.)
2. Open `config.php` and fill up the constants

    For example: 

    define("SERVER", "localhost");
    define("USERNAME", "root");
    define("PASSWORD", "12345");
    define("DB_NAME", "myDB");
    ///////////////////////////////////////////////

3. Define the table that you want to populate (Not need for the demo its already assigned)
    For example:

    define("DB_TABLE", "kt_users");
    ///////////////////////////////////////////////

4. Define database columns that you want to include in table.
    For example:

    define(
        "COLUMNS",
        array(
            "id",
            "first_name",
            "last_name",
            "email",
            "gender",
            "ip_address"
        )
    );
    ///////////////////////////////////////////////