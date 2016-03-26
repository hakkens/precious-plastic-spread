<?php


function getService($service_account_email, $key_file_location)
{
  // Creates and returns the Analytics service object.

  // Load the Google API PHP Client Library.
  require_once 'google-api-php-client/src/Google/autoload.php';

  // Create and configure a new client object.
  $client = new Google_Client();
  $client->setApplicationName("GoogleAnalytics");
  $analytics = new Google_Service_Analytics($client);

  // Read the generated client_secrets.p12 key.
  $key = file_get_contents($key_file_location);
  $cred = new Google_Auth_AssertionCredentials(
      $service_account_email,
      array(Google_Service_Analytics::ANALYTICS_READONLY),
      $key
  );
  $client->setAssertionCredentials($cred);
  if($client->getAuth()->isAccessTokenExpired()) {
    $client->getAuth()->refreshTokenWithAssertion($cred);
  }

  return $analytics;
}

?>