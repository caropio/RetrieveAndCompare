<?php

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'connectDB.php';

// Check DB connection
if ($db->connect_error) {
    die("Connection failed: " . $db->connect_error);
}

$EXP 		= stripslashes(htmlspecialchars($_POST['exp']));
$EXPID 		= stripslashes(htmlspecialchars($_POST['expID']));
$ID 		= stripslashes(htmlspecialchars($_POST['id']));
$ELIC 		= stripslashes(htmlspecialchars($_POST['elicitation_type']));
$TEST 		= stripslashes(htmlspecialchars($_POST['test']));
$TRIAL 		= stripslashes(htmlspecialchars($_POST['trial']));
$COND 		= stripslashes(htmlspecialchars($_POST['condition']));
$CONT1 		= stripslashes(htmlspecialchars($_POST['cont_idx_1']));
$CONT2 		= stripslashes(htmlspecialchars($_POST['cont_idx_2']));
$SYML 		= stripslashes(htmlspecialchars($_POST['symL']));
$SYMR 		= stripslashes(htmlspecialchars($_POST['symR']));
$LR 		= stripslashes(htmlspecialchars($_POST['choice_left_right']));
$RTIME 		= stripslashes(htmlspecialchars($_POST['reaction_time']));
$OUT 		= stripslashes(htmlspecialchars($_POST['outcome']));
$CF_OUT 	= stripslashes(htmlspecialchars($_POST['cf_outcome']));
$CHOICE 	= stripslashes(htmlspecialchars($_POST['choice']));
$CORRECT_CHOICE 	= stripslashes(htmlspecialchars($_POST['correct_choice']));
$REW 		= stripslashes(htmlspecialchars($_POST['reward']));
$SESSION 	= stripslashes(htmlspecialchars($_POST['session']));
$P1 		= stripslashes(htmlspecialchars($_POST['p1']));
$P2 		= stripslashes(htmlspecialchars($_POST['p2']));
$OP1 		= stripslashes(htmlspecialchars($_POST['option1']));
$OP2 		= stripslashes(htmlspecialchars($_POST['option2']));
$EV1 		= stripslashes(htmlspecialchars($_POST['ev1']));
$EV2 		= stripslashes(htmlspecialchars($_POST['ev2']));
$CATCH      = stripslashes(htmlspecialchars($_POST['iscatch']));
$INV 		= stripslashes(htmlspecialchars($_POST['inverted']));
$CTIME 		= stripslashes(htmlspecialchars($_POST['choice_time']));
$DIST 		= stripslashes(htmlspecialchars($_POST['elic_distance']));
$PLOT 		= stripslashes(htmlspecialchars($_POST['p_lottery']));


// Create the database if it doesn't exist
if ($db->query("CREATE DATABASE IF NOT EXISTS mydatabase") === FALSE) {
    die("Error creating database: " . $db->error);
}

// Select the database
if (!$db->select_db('mydatabase')) {
    die("Error selecting database: " . $db->error);
}

// Create the table if it doesn't exist
$table_create_query = "
    CREATE TABLE IF NOT EXISTS learning_data_r_and_c (
        `EXP` varchar(20) NOT NULL,
        `EXPID` varchar(20) NOT NULL,
        `ID` varchar(100) NOT NULL,
        `ELIC` int(11) NOT NULL,
        `P1` double NOT NULL,
        `P2` double NOT NULL,
        `RTIME` bigint(20) NOT NULL,
        `OUT` int(11) NOT NULL,
        `CF_OUT` int(11) NOT NULL,
        `CHOICE` int(11) NOT NULL,
        `CORRECT_CHOICE` int(11) NOT NULL,
        `TEST` int(11) NOT NULL,
        `TRIAL` int(11) NOT NULL,
        `COND` int(11) NOT NULL,
        `CONT1` int(11) NOT NULL,
        `CONT2` int(11) NOT NULL,
        `SYML` varchar(20) NOT NULL,
        `SYMR` varchar(20) NOT NULL,
        `LR` int(11) NOT NULL,
        `REW` double NOT NULL,
        `SESSION` int(11) NOT NULL,
        `OP1` int(11) NOT NULL,
        `OP2` int(11) NOT NULL,
        `EV1` double NOT NULL,
        `EV2`  double NOT NULL,
        `CATCH` tinyint(4) NOT NULL,
        `INV` tinyint(4) NOT NULL,
        `CTIME` bigint(20) NOT NULL,
        `DIST` int(11) NOT NULL,
        `PLOT` double NOT NULL,
        `DBTIME` time NOT NULL
    )
";

if ($db->query($table_create_query) === FALSE) {
    die("Error creating table: " . $db->error);
}

// Prepare and execute the insert query
$stmt = $db->prepare("INSERT INTO learning_data_r_and_c VALUE(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");

if ($stmt === FALSE) {
    die("Error preparing statement: " . $db->error);
}

$stmt->bind_param("sssiddidiiiiiiiissidiiiddiiiid",
    $EXP,$EXPID,$ID, $ELIC, $P1,$P2, $RTIME, $OUT, $CF_OUT, $CHOICE, $CORRECT_CHOICE, $TEST,$TRIAL,$COND, $CONT1, $CONT2, $SYML,$SYMR,$LR,$REW,$SESSION,$OP1,$OP2, $EV1, $EV2, $CATCH, $INV,$CTIME, $DIST, $PLOT
);

if ($stmt->execute() === FALSE) {
    die("Error executing statement: " . $stmt->error);
}

$err = $stmt->errno ;
$data = array(
      'error' => $err,
    );
  
// Close the statement and database connection
$stmt->close();
$db->close();

# echo json_encode($data);
echo "Data inserted successfully";

 ?>
