<?php
    session_start();

    $date = (new DateTime())->modify('-1 month'); // set to previous month
    $employees = ["Michael Rembrandt", "Redd Harlan", "Lauren Towner", 
                  "Carla Winslow", "Hugh Farnham", "Anthony Smith", 
                  "Erik Williams", "Clare Sidney", "Emma Chavez",
                  "Annie Gregory", "Suzanne Bender", "Kevin Mitnick"];
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Employee of the Month</title>
        <?php include 'topnav.php'; ?> 
        <link rel="stylesheet" href="./css/month.css">
    </head>
    <p>Here, we honor our greatest employees.</p>
    <div class="grid-container">
        <?php
            for ($i = 0; $i < 12; $i++) {
                echo '<div class="box">';

                // Crop the images so they're all the same size.
                printf("<img src='./images/employees/%d.jpg' width='200'>", $i);

                printf("<p>%s</p>", $employees[$i]);
                printf("<p>%s</p>", $date->format('F Y'));
                echo '</div>';
                $date->modify('-1 month');
            }
        ?>
    </div>
</html>