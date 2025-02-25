function postComment() {
   var wif = document.getElementById('wif').value;
   var author = document.getElementById('author').value;
   var parentUrl = document.getElementById('parent').value;
   var body = document.getElementById('commentBody').value;
   var permlink = 'comment-' + new Date().getTime();
   var beneficiaryAccounts = document.getElementById('beneficiaryAccounts').value.split(',').map(acc => acc.trim());
   var beneficiaryPercents = document.getElementById('beneficiaryPercents').value.split(',').map(pct => parseInt(pct.trim()) * 100);

   // Ekstrak Author dan Permalink dari URL
   var urlParts = parentUrl.split('@');
   if (urlParts.length === 2) {
      var authorPermlink = urlParts[1].split('/');
      if (authorPermlink.length === 2) {
         var parentAuthor = authorPermlink[0];  // Author
         var parentPermlink = authorPermlink[1]; // Permalink
      } else {
         alert("Invalid URL format for Parent. Please use the correct format.");
         return;
      }
   } else {
      alert("Invalid URL format for Parent. Please use the correct format.");
      return;
   }

   if (!wif || !author || !parentAuthor || !parentPermlink || !body) {
      alert("Please fill in all fields.");
      return;
   }

   var extensions = [];
   if (beneficiaryAccounts.length > 0 && beneficiaryPercents.length > 0 && beneficiaryAccounts.length === beneficiaryPercents.length) {
      var beneficiaries = beneficiaryAccounts.map((account, index) => ({ account: account, weight: beneficiaryPercents[index] }));
      extensions = [[0, { beneficiaries: beneficiaries }]];
   }

   var jsonMetadata = JSON.stringify({
      tags: ['comment'],
      app: 'newPost/v1.0'
   });

   // Post Comment
   hive.broadcast.comment(
      wif,
      parentAuthor,
      parentPermlink,
      author,
      permlink,
      '',
      body,
      jsonMetadata,
      function (err, result) {
         if (err) {
            alert('Error posting comment: ' + err);
         } else {
            // Jika comment berhasil, langsung atur beneficiaries
            setCommentOptions(wif, author, permlink, extensions, function(success) {
               if (success) {
                  alert('Comment and Beneficiaries set successfully!');
               } else {
                  alert('Comment posted successfully, but failed to set beneficiaries.');
               }
            });
         }
      }
   );
}

function setCommentOptions(wif, author, permlink, extensions, callback) {
   if (extensions.length === 0) {
      callback(true); // Jika tidak ada beneficiaries, langsung sukses
      return;
   }

   hive.broadcast.commentOptions(
      wif,
      author,
      permlink,
      "1000000.000 HBD",
      10000,
      true,
      true,
      extensions,
      function(err, result) {
         if (err) {
            console.error("Error setting comment options:", err);
            callback(false);
         } else {
            callback(true);
         }
      }
   );
}
