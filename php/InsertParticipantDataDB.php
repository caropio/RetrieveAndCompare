<?php

include 'connectDB.php';

$EXP 		= stripslashes(htmlspecialchars($_POST['exp']));
$EXPID 		= stripslashes(htmlspecialchars($_POST['expID']));
$ID 		= stripslashes(htmlspecialchars($_POST['id']));
$POINTS     = stripslashes(htmlspecialchars($_POST['points']));
$PENCE      = stripslashes(htmlspecialchars($_POST['pence']));
$POUNDS     = stripslashes(htmlspecialchars($_POST['pounds']));
$POUNDSFINAL= stripslashes(htmlspecialchars($_POST['poundsfinal']));

$stmt = $db->prepare("INSERT INTO participant_r_and_c VALUE(?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssdddd",
    $EXP,$EXPID,$ID,$POINTS, $PENCE, $POUNDS, $POUNDSFINAL);
$stmt->execute();
$err = $stmt->errno ;
$data = array(
      'error' => $err,
    );
$stmt->close();
 $db->close();
echo json_encode($data);
 ?>
