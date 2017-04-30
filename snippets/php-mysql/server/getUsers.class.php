<?php
require_once("../config.php");

//
class Users
{
    private $DB;

    // Required name od the table
    private $_table = DB_TABLE;

    // require table columns
    private $_columns = COLUMNS;

    public function __construct()
    {
        $this->DB = $this->connectToDB();
        $this->DB->query('SET NAMES utf8');

        $this->assignJSONParameters();
        $this->total = $this->getNumberOfAccounts();
        $this->printJson();
    }

    private function connectToDB()
    {
        $link = mysqli_connect(SERVER, USERNAME, PASSWORD, DB_NAME);

        if (!$link) {
            echo "Error: Unable to connect to MySQL." . PHP_EOL;
            echo "Debugging errno: " . mysqli_connect_errno() . PHP_EOL;
            echo "Debugging error: " . mysqli_connect_error() . PHP_EOL;
            exit;
        }
        //echo "SUCCESS CONNECTION";
        return $link;
    }

    public function postField($name)
    {
        $value = (isset($_POST[$name]) ? ($_POST[$name]) : '');
        return $value;
    }

    private function assignJSONParameters()
    {
        // store in array json post parameters
        $_POST = json_decode(file_get_contents('php://input'), true);
        foreach ($_POST as $key => $data) {
            $this->{$key} = $data;
        }
    }

    public function assignParameters()
    {
        foreach ($this->parameters as $parameter) {
            $this->{$parameter} = $this->postField($parameter);
        }
    }

    private function orderBy()
    {
        $sort = null;
        $results = null;
        if ($this->sortOrder) {
            if ($this->sortOrder == 'ascending') {
                $sort = 'ASC';
            } else if ($this->sortOrder == 'descending') {
                $sort = 'DESC';
            }
        }
        if ($this->orderBy) {
            $results = " ORDER BY {$this->orderBy} {$sort}";
        }
        return $results;
    }

    private function getUsers()
    {
        $col = implode(",", $this->_columns);
        $stm = "SELECT {$col} FROM {$this->_table} WHERE ";
        foreach ($this->_columns as $column) {
            $stm .= "{$column} LIKE '%{$this->search}%' || ";
        }
        $stm = rtrim($stm, '|| ');
        $stm .= " {$this->orderBy()} LIMIT " . (($this->page - 1) * $this->size) . ", " . $this->size;
        #error_log($stm);
        $query = $this->DB->query($stm);
        return $query;

    }

    private function getNumberOfAccounts()
    {
        $stm = "SELECT count(*) as totals from {$this->_table} WHERE ";
        foreach ($this->_columns as $column) {
            $stm .= "{$column} LIKE '%{$this->search}%' || ";
        }

        $stm = rtrim($stm, '|| ');
        // print $stm;
        $query = $this->DB->query($stm);

        $fetch = $query->fetch_object();
        return $fetch->totals;
    }

    public function escapeJsonString($value)
    { # list from www.json.org: (\b backspace, \f formfeed)
        $escapers = array("\\", "/", "\"", "\n", "\r", "\t", "\x08", "\x0c");
        $replacements = array("\\\\", "\\/", "\\\"", "\\n", "\\r", "\\t", "\\f", "\\b");
        $result = str_replace($escapers, $replacements, $value);
        return $result;
    }

    private function printJson()
    {
        $result = '{"subset": ';

        $result .= $this->printCollections();

        $result .= ', "page": ' . $this->page . ', "total": ' . $this->total . '}';

        echo $result;
    }

    private function printCollections()
    {
        $tags = implode('","', $this->_columns);
        $query = $this->getUsers();
        $return = '[ ["' . $tags . '"],';
        while ($obj = $query->fetch_object()) {
            $return .= '[';
            foreach ($this->_columns as $column) {
                $return .= '"' . $this->escapeJsonString($obj->{$column}) . '",';
            }
            $return = rtrim($return, ',') . '],';
        }
        $return = rtrim($return, ',') . ']';
        return $return;
    }
}


new Users();