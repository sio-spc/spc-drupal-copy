<?php

namespace Drupal\Tests\paragraphs_library\Functional;

use Drupal\field_ui\Tests\FieldUiTestTrait;
use Drupal\node\Entity\Node;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\paragraphs\Entity\ParagraphsType;
use Drupal\Tests\BrowserTestBase;
use Drupal\Tests\paragraphs\FunctionalJavascript\ParagraphsTestBaseTrait;

/**
 * Tests the functionality of the Paragraphs Library.
 *
 * @group paragraphs_library
 */
class ParagraphsLibraryItemTest extends BrowserTestBase {

  use ParagraphsTestBaseTrait, FieldUiTestTrait;

  /**
   * Modules to be enabled.
   *
   * @var string[]
   */
  public static $modules = [
    'node',
    'paragraphs_library',
    'block',
    'field_ui',
  ];

  /**
   * {@inheritdoc}
   */
  public function setUp() {
    parent::setUp();
    $this->addParagraphedContentType('paragraphed_test', 'field_paragraphs');

    $this->addParagraphsType('text');
    $this->addFieldtoParagraphType('text', 'field_text', 'text');

    $this->addParagraphsType('paragraphs_container');
    $this->addParagraphsField('paragraphs_container', 'paragraphs_container_paragraphs', 'paragraph');

    $admin = $this->drupalCreateUser([
      'create paragraphed_test content',
      'edit any paragraphed_test content',
      'view paragraphed_test revisions',
      'administer paragraphs library',
    ]);
    $this->drupalLogin($admin);

    $this->drupalPlaceBlock('system_breadcrumb_block');
    $this->drupalPlaceBlock('local_tasks_block');
    $this->drupalPlaceBlock('local_actions_block');
    $this->drupalPlaceBlock('page_title_block');
  }

  /**
   * Check that conversion to and from library items does not have side effects.
   */
  public function testNoConversionSideEffects() {
    // Create a text paragraph.
    $text_paragraph = Paragraph::create([
      'type' => 'text',
      'field_text' => [
        'value' => 'Test text 1',
        'format' => 'plain_text',
      ],
    ]);
    $text_paragraph->save();

    // Create a container that contains the text paragraph.
    $container_paragraph = Paragraph::create([
      'type' => 'paragraphs_container',
      'paragraphs_container_paragraphs' => [$text_paragraph],
    ]);
    $container_paragraph->save();

    // Add a node with the paragraphs.
    $node = Node::create([
      'type' => 'paragraphed_test',
      'title' => 'Test Node',
      'field_paragraphs' => [$container_paragraph],
    ]);
    $node->save();

    // Enable conversion to library item.
    ParagraphsType::load('paragraphs_container')
      ->setThirdPartySetting('paragraphs_library', 'allow_library_conversion', TRUE)
      ->save();

    // Convert the container to a library item.
    $this->drupalGet('/node/' . $node->id() . '/edit');
    $this->drupalPostForm(NULL, [], 'Promote to library');
    $this->drupalPostForm(NULL, [], 'Save');

    // Check that the child text paragraph is present in the node.
    $this->assertSession()->pageTextContains('Test text 1');

    $node = $this->drupalGetNodeByTitle('Test Node');
    /** @var \Drupal\paragraphs_library\LibraryItemInterface $library_item */
    $library_item = $node->get('field_paragraphs')->entity->get('field_reusable_paragraph')->entity;

    // Remove the child text paragraph from the library item.
    $this->drupalGet('/admin/content/paragraphs/' . $library_item->id() . '/edit');
    $this->getSession()->getPage()->fillField('Label', 'Test Library Item');
    $this->getSession()->getPage()
      ->findButton('paragraphs_0_subform_paragraphs_container_paragraphs_0_remove')
      ->press();
    $this->drupalPostForm(NULL, [], 'Save');

    // Check that the child text paragraph is no longer present in the
    // library item or the node.
    $this->drupalGet('/admin/content/paragraphs/' . $library_item->id());
    $this->assertSession()->pageTextNotContains('Test text 1');
    $this->drupalGet('/node/' . $node->id());
    $this->assertSession()->pageTextNotContains('Test text 1');

    // View the second-to-last revision.
    $this->drupalGet('/node/' . $node->id() . '/revisions');
    $this->getSession()->getPage()
      ->find('css', '.node-revision-table')
      ->find('xpath', '(//tbody//tr)[2]//a')
      ->click();
    $revision_url = $this->getSession()->getCurrentUrl();
    $this->assertContains('/node/' . $node->id() . '/revisions/', $revision_url);
    $this->assertContains('view', $revision_url);

    // Check that the child text paragraph is still present in this revision.
    $this->assertSession()->pageTextContains('Test text 1');

    // Add a new text paragraph to the library item.
    $this->drupalGet('/admin/content/paragraphs/' . $library_item->id() . '/edit');
    $this->drupalPostForm(NULL, [], 'Add text');
    $this->getSession()->getPage()->fillField('field_text', 'Test text 2');
    $this->drupalPostForm(NULL, [], 'Save');

    // Check that the child text paragraph is present in the library item and
    // the node.
    $this->drupalGet('/admin/content/paragraphs/' . $library_item->id());
    $this->assertSession()->pageTextContains('Test text 2');
    $this->drupalGet('/node/' . $node->id());
    $this->assertSession()->pageTextContains('Test text 2');

    // Convert the library item in the node back to a container paragraph and
    // delete it.
    $this->drupalGet('/node/' . $node->id() . '/edit');
    $this->drupalPostForm(NULL, [], 'Unlink from library');
    $this->getSession()->getPage()
      ->findButton('field_paragraphs_0_subform_paragraphs_container_paragraphs_0_remove')
      ->press();
    $this->drupalPostForm(NULL, [], 'Save');

    // Check that the child text paragraph is no longer present in the node but
    // still present in the library item.
    $this->drupalGet('/node/' . $node->id());
    $this->assertSession()->pageTextNotContains('Test text 2');
    $this->drupalGet('/admin/content/paragraphs/' . $library_item->id());
    $this->assertSession()->pageTextContains('Test text 2');
  }

  /**
   * Test that usage tab are presented for library item.
   */
  public function testLibraryItemUsageTab() {
    $admin = $this->drupalCreateUser([
      'create paragraphed_test content',
      'edit any paragraphed_test content',
      'administer paragraphs library',
      'delete all revisions',
      'revert all revisions',
      'administer content types',
      'administer node fields',
      'administer paragraphs types',
      'administer node form display',
      'administer paragraph fields',
      'administer paragraph form display',
      'access entity usage statistics',
    ]);
    $this->drupalLogin($admin);

    $this->addParagraphsType('test_content');
    $this->addParagraphsType('nested_paragraph');

    $this->fieldUIAddNewField('admin/structure/paragraphs_type/test_content', 'paragraphs_text', 'Test content', 'text_long', [], []);

    // Add nested paragraph field.
    $this->fieldUIAddNewField('admin/structure/paragraphs_type/nested_paragraph', 'err_field', 'Nested', 'field_ui:entity_reference_revisions:paragraph', [
      'settings[target_type]' => 'paragraph',
      'cardinality' => '-1',
    ], []);

    // Add nested paragraph directly in library.
    $this->drupalGet('admin/content/paragraphs/add/default');
    $page = $this->getSession()->getPage();
    $assert_session = $this->assertSession();
    $page->pressButton('Add nested_paragraph');
    $page->find('css', '.paragraphs-subform')->pressButton('Add test_content');

    $edit = [
      'label[0][value]' => 'Test usage nested paragraph',
      'paragraphs[0][subform][field_err_field][0][subform][field_paragraphs_text][0][value]' => 'Example text for revision in nested paragraph.',
    ];
    $this->drupalPostForm(NULL, $edit, 'Save');
    $assert_session->pageTextContains('Paragraph Test usage nested paragraph has been created.');

    // Create content with referenced paragraph.
    $this->drupalGet('node/add/paragraphed_test');
    $page->pressButton('Add From library');
    $edit = [
      'title[0][value]' => 'Test content',
      'field_paragraphs[0][subform][field_reusable_paragraph][0][target_id]' => 'Test usage nested paragraph'
    ];
    $this->drupalPostForm(NULL, $edit,'Save');

    // Check Usage tab.
    $this->drupalGet('admin/content/paragraphs');
    $this->clickLink('Test usage nested paragraph');
    $this->clickLink('Usage');
    $assert_session->pageTextContains('Entity usage information for Test usage nested paragraph');

    $assert_session->elementContains('css', 'table tbody tr td:nth-child(1)', 'Test content &gt; field_paragraphs');
    $assert_session->elementContains('css', 'table tbody tr td:nth-child(2)', 'paragraph');
    $assert_session->elementContains('css', 'table tbody tr td:nth-child(3)', 'entity_reference');
    $assert_session->elementContains('css', 'table tbody tr td:nth-child(4)', '1');

    // Assert breadcrumb.
    $assert_session->elementContains('css', '.breadcrumb ol li:nth-child(1)', 'Home');
    $assert_session->elementContains('css', '.breadcrumb ol li:nth-child(2)', 'Paragraphs library');
    $assert_session->elementContains('css', '.breadcrumb ol li:nth-child(3)', 'Test usage nested paragraph');

    // Unlink library item and check usage tab.
    $node = $this->drupalGetNodeByTitle('Test content');
    $this->drupalGet($node->toUrl('edit-form'));
    $this->drupalPostForm(NULL, [], 'Unlink from library');
    $this->drupalPostForm(NULL, ['revision' => TRUE], 'Save');

    // Check Usage tab.
    $this->drupalGet('admin/content/paragraphs');
    $this->clickLink('Test usage nested paragraph');
    $this->clickLink('Usage');
    $assert_session->pageTextContains('Entity usage information for Test usage nested paragraph');

    $assert_session->elementContains('css', 'table tbody tr td:nth-child(1)', 'Test content &gt; field_paragraphs (previous revision)');
    $assert_session->elementContains('css', 'table tbody tr td:nth-child(2)', 'paragraph');
    $assert_session->elementContains('css', 'table tbody tr td:nth-child(3)', 'entity_reference');
    $assert_session->elementContains('css', 'table tbody tr td:nth-child(4)', '1');
  }

}
