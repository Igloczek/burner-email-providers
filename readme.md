# A list of burner email providers (Extended Spin-off)

This repository is a spin-off of [wesbos/burner-email-providers](https://github.com/wesbos/burner-email-providers) with a narrower, but stricter scope. It contains **only the domains that are NOT present in the upstream repository**.

## The Philosophy

Defining what exactly constitutes a "burner" or "temp" email is subjective. I have a much lower tolerance for spam and abuse than the maintainers of the upstream repository, and I don't want to waste time debating whether a specific service qualifies as a "temporary" email provider or not.

Here is my simple rule of thumb: If I see multiple suspicious sign-ups originating from a single domain in any of my applications, and there's no indication that these are legitimate users, that domain gets added to this list and is automatically banned across all my projects.

### For Developers (Using this list)

This list is **intentionally short and not meant to be exhaustive**. It does not try to list every single burner provider out there. Its sole purpose is to fill the gaps left by other, more conservative sources (like the upstream repo) by catching providers that are often heavily abused by spammers but rejected by other maintainers.

My recommended way to use this list in conjunction with the upstream one, as well as a list of free email providers that I use and trust, is described in this gist: [https://gist.github.com/Igloczek/7bfc459109f4a01f7e046b591d2a842a](https://gist.github.com/Igloczek/7bfc459109f4a01f7e046b591d2a842a).

### For Email Providers and Affected Users (If your domain is on this list)

If your domain is listed here, the most likely reason is that your email provider offers a free tier with little to no verification, making it easy for spammers to abuse. Before requesting removal, please verify with your provider that this issue has been addressed.

If you can confirm that the provider has taken steps to prevent abuse (e.g., added verification, rate limiting, or other anti-spam measures), feel free to open an issue requesting removal, and I'll be happy to take the domain off the list.
