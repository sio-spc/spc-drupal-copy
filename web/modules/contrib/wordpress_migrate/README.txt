The WordPress Migrate module provides tools for setting up migration processes
from the WordPress blog to a Drupal 8 site. By providing a few configuration
settings and a pointer to an XML export file, migration configuration entities
will be generated which can then be executed or otherwise managed with the
migrate_tools module.

There are a few ways to make use of wordpress_migrate:

Drush command
=============
A single drush command, wordpress-migrate-generate, is provided for generating
WordPress migrations from a few simple options:

Arguments:
 file_uri                             Address of the WordPress export file to migrate into Drupal.

Options:
 --group-id=<my_wordpress_import>     ID of the migration group to create. Required.
 --prefix=<my_>                       String to prefix to the IDs of generated migrations.
 --post-type=<blog>                   Machine name of Drupal node bundle to hold imported post content.
 --post-text-format=<restricted_html> Machine name of text format for body field on imported post content.
 --page-type=<blog>                   Machine name of Drupal node bundle to hold imported page content.
 --page-text-format=<restricted_html> Machine name of text format for body field on imported page content.
 --category-vocabulary=<categories>   Machine name of vocabulary to hold imported categories.
 --tag-vocabulary=<tags>              Machine name of vocabulary to hold imported tags.
 --default-author=<author_account>    If present, username to author all imported content. If omitted, users will
                                      be imported from WordPress.

Thus, this command (on a D8 system where articles have a comment field but pages don't):

wordpress-migrate-generate /var/data/my_wp_export.xml --group-id=old_blog --prefix=blog_ --tag-vocabulary=tags --post-type=article --post-text-format=restricted_html --page-type=page --page-text-format=full_html

will create the following migrations in the "old_blog" group:

 blog_wordpress_authors
 blog_wordpress_categories
 blog_wordpress_tags
 blog_wordpress_content_post
 blog_wordpress_comment_post
 blog_wordpress_content_page

You can then use migrate_tools drush commands like "drush mi --group=old_blog"
to manage the migrations.

UI
==
Enabling the wordpress_migrate_ui module adds an "Add import from WordPress"
button to the migrate_tools UI at /admin/structure/migrate - this begins a
wizard which prompts you for the same configuration options you see for the
drush command above.

API
===
You may also programmatically configure a set of WordPress migrations by
constructing a configuration array and passing it to the generator:

  use Drupal\wordpress_migrate\WordPressMigrationGenerator;

  $configuration = [
   'file_uri' => '/var/data/my_wp_export.xml',
   'group_id' => 'old_blog',
   'prefix' => 'blog_',
   'default_author' => 'editor_account',
   'tag_vocabulary' => 'tags',
   'category_vocabulary' => 'wp_categories',
   'post' => [
     'type' => 'article',
     'text_format' => 'restricted_html',
   ],
   'page' => [
     'type' => 'page',
     'text_format' => 'full_html',
   ],
  ];
  $generator = new WordPressMigrationGenerator($configuration);
  $generator->createMigrations();


Known issues
============
File (attachment) migration is not yet implemented - it will be done once
https://www.drupal.org/node/2695297 gets into Drupal core.

Comment migration will not work unless there's a version of migrate_plus that
fixes https://www.drupal.org/node/2742233.

Much more work to be done on the details...
