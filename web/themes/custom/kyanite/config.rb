css_dir = "css/"
require 'sass-globbing'


line_comments = (environment == :production) ? false : true
output_style = (environment == :production) ? :compressed : :expanded
sass_options = {:debug_info => (environment == :production) ? false : true}
