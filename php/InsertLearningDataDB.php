<?php

include 'connectDB.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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

try {
    mysqli_set_charset($db, 'utf8');
    $EXP = mysqli_real_escape_string($db, $EXP);
    $EXPID = mysqli_real_escape_string($db, $EXPID);
    $ID = mysqli_real_escape_string($db, $ID);
    $SYML= mysqli_real_escape_string($db, $SYML);
    $SYMR= mysqli_real_escape_string($db, $SYMR);
  
  } catch (Exception $e) {
    echo "Error when cleaning strings: " . $e->getMessage();
  }
  
  if ($db->connect_error) {
    die("Connection failed: " . $db->connect_error);
  }
  
  # insert all data into turing table
  # variables are named as column names in the database
  $sql = <<<EOD
  INSERT INTO r_and_c_test 
  (EXP, EXPID, ID, ELIC, P1, P2, RTIME, OUT, CF_OUT, CHOICE, CORRECT_CHOICE, TEST, TRIAL, COND, CONT1, CONT2, SYML, SYMR, LR, REW, SESSION, OP1, OP2, EV1, EV2, CATCH, INV, CTIME)
  VALUES ('$EXP', '$EXPID', '$ID', $ELIC, $P1, $P2, $RTIME, $OUT, $CF_OUT, $CHOICE, $CORRECT_CHOICE, $TEST, $TRIAL, $COND,
  $CONT1, $CONT2, '$SYML', '$SYMR', $LR, $REW, $SESSION, $OP1, $OP2, $EV1, $EV2, $CATCH, $INV, $CTIME)
  EOD;
  
  if ($db->query($sql) === TRUE) {
    echo "New record created successfully";
  
  } else {
    echo "Error: " . $sql . "<br>" . $db->error;
    header('HTTP/1.1 500 Internal Server');
    header('Content-Type: application/json; charset=UTF-8');
    die(json_encode(array('message' => 'ERROR', 'code' => 1337)));
  }
  
  $db->close();
