<?php

include 'connectDB.php';

$exp                   = stripslashes(htmlspecialchars($_POST['exp']));
$expID                 = stripslashes(htmlspecialchars($_POST['expID']));
$id                    = stripslashes(htmlspecialchars($_POST['id']));
$test               = stripslashes(htmlspecialchars($_POST['test']));
$choice = stripslashes(htmlspecialchars($_POST['choice']));
$outcome = stripslashes(htmlspecialchars($_POST['outcome']));
$session               = stripslashes(htmlspecialchars($_POST['session']));
$phase = stripslashes(htmlspecialchars($_POST['phase']));
$trial = stripslashes(htmlspecialchars($_POST['trial']));
$sum = stripslashes(htmlspecialchars($_POST['sum']));


if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}
# '$variable' if string, otherwise $variable
$sql = "INSERT INTO r_and_c_bonus_data (exp, expID, id, test, choice, outcome, session, phase, trial, sum) VALUES ('$exp', $expID, '$id', $test, $choice, $outcome, $session, $phase, $trial, $sum)";

if ($conn->query($sql) === TRUE) {
  echo "New record created successfully";
} else {
  echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
 ?>
